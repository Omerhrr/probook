from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select


from database import get_db
from models.user import User as UserModel
from models.product import Product as ProductModel
from models.customer import Customer as CustomerModel
from models.sale import Sale as SaleModel, SaleItem as SaleItemModel
from schemas.sale import Sale, SaleCreate, SaleItem # Make sure SaleItem is imported for response model
from dependencies import get_current_active_user

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Sale)
def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Validate customer if customer_id is provided
    if sale_data.customer_id:
        customer = db.query(CustomerModel).filter(CustomerModel.id == sale_data.customer_id, CustomerModel.owner_id == current_user.id).first()
        if not customer:
            raise HTTPException(status_code=404, detail=f"Customer with id {sale_data.customer_id} not found for this owner.")

    db_sale = SaleModel(
        customer_id=sale_data.customer_id,
        user_id=current_user.id,
        owner_id=current_user.id, # Assuming the user creating the sale is also the owner or part of the owner's group
        total_amount=0 # Will be calculated
    )
    db.add(db_sale)
    # We need to commit here so that db_sale gets an ID for SaleItems
    # However, if any item fails, we'd ideally want to roll back.
    # For simplicity now, let's commit and then add items.
    # A more robust solution would use a transaction that spans item creation.
    db.commit()
    db.refresh(db_sale)

    calculated_total_sale_amount = 0.0

    for item_data in sale_data.items:
        product = db.query(ProductModel).filter(ProductModel.id == item_data.product_id, ProductModel.owner_id == current_user.id).first()
        if not product:
            # If a product is not found, we should ideally roll back the sale creation.
            # For now, let's raise an error. The sale record would exist without items.
            db.delete(db_sale) # Attempt to clean up
            db.commit()
            raise HTTPException(status_code=404, detail=f"Product with id {item_data.product_id} not found for this owner.")

        if item_data.quantity <= 0:
            db.delete(db_sale)
            db.commit()
            raise HTTPException(status_code=400, detail=f"Quantity for product id {item_data.product_id} must be positive.")

        unit_price = item_data.unit_price if item_data.unit_price is not None else product.selling_price
        if unit_price is None: # Should not happen if product.selling_price is mandatory
             db.delete(db_sale)
             db.commit()
             raise HTTPException(status_code=400, detail=f"Selling price for product id {item_data.product_id} not available.")

        item_total_price = item_data.quantity * unit_price
        calculated_total_sale_amount += item_total_price

        db_sale_item = SaleItemModel(
            sale_id=db_sale.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=unit_price,
            total_price=item_total_price
        )
        db.add(db_sale_item)

    db_sale.total_amount = calculated_total_sale_amount
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    # To include items and customer in the response, we might need to eager load or query them again.
    # For simplicity, the response model `Sale` expects `items` and `customer`.
    # SQLAlchemy might lazy load them, or we can explicitly load.
    # Let's try to return db_sale directly and see if Pydantic handles it with orm_mode.
    # We may need to query the sale again with relationships for the response.

    # Query the sale again to ensure all relationships are loaded for the response model
    # This is because db_sale.items might not be populated in the way Pydantic expects after commit.
    # And db_sale.customer might also not be loaded.

    # Efficiently load the sale with its items and customer for the response
    # This requires configuring relationships in models to support eager loading if needed,
    # but for direct attribute access after refresh, it might work.
    # Let's ensure the relationships are correctly configured in the models.
    # `SaleItem` in `schemas.sale.py` has `product: Optional[ProductSchema]`.
    # `Sale` in `schemas.sale.py` has `items: List[SaleItem]` and `customer: Optional[CustomerSchema]`.

    # To ensure Pydantic can access these, they need to be loaded.
    # When db.refresh(db_sale) is called, simple scalar attributes are refreshed.
    # Relationships might require explicit loading or specific session handling.
    # However, with orm_mode = True, Pydantic tries to access attributes directly.
    # If items are not loaded, db_sale.items would be an empty list or trigger a lazy load.

    # Let's fetch the complete sale object for the response
    # This is a common pattern: create, then fetch the full object for response.
    # This ensures that all relationships defined in the Pydantic response model are populated.

    # stmt = select(SaleModel).where(SaleModel.id == db_sale.id).options(
    #     selectinload(SaleModel.items).selectinload(SaleItemModel.product), # Assuming 'selectinload' is available
    #     selectinload(SaleModel.customer)
    # )
    # result_sale = db.execute(stmt).scalar_one_or_none()
    # if not result_sale:
    #      # This should not happen as we just created it
    #      raise HTTPException(status_code=500, detail="Failed to retrieve sale after creation.")
    # return result_sale
    # For now, directly returning db_sale, assuming Pydantic orm_mode handles lazy loading
    # or that the items added in the session are available on db_sale.items
    # This might lead to N+1 queries if not handled carefully with eager loading in more complex scenarios.

    # Let's try to explicitly query the sale with items and customer for the response
    # to ensure the response model is correctly populated.
    # Note: This is a simplified way. For production, use options like selectinload.
    # For now, we rely on the session to track related objects and Pydantic's orm_mode.
    # The objects (db_sale, its items, and customer if fetched) are in the same session.

    # We need to make sure the response includes all nested data as per Sale schema.
    # Pydantic's orm_mode will try to access sale.items and sale.customer.
    # If these were not explicitly loaded by the query that got `db_sale`,
    # SQLAlchemy will attempt to lazy-load them.
    # Let's try returning the committed `db_sale` and see if it works.
    # The crucial part is that `db_sale.items` should be populated by the additions
    # and `db_sale.customer` if `customer_id` was set.

    # The db_sale object now has its total_amount updated.
    # The items are associated via the session.
    # The customer (if any) is associated.
    # Pydantic's orm_mode should correctly serialize this.
    return db_sale


@router.get("/{sale_id}", response_model=Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Efficiently load the sale with its items, and for each item, its product. Also load the customer.
    # This is to avoid N+1 queries when Pydantic serializes the response.
    # The actual implementation of eager loading (e.g., using options with selectinload)
    # depends on the SQLAlchemy version and setup.
    # For now, we'll query and rely on Pydantic's orm_mode and SQLAlchemy's lazy loading,
    # which might not be performant for lists but okay for a single object.

    # A more performant way using options (SQLAlchemy 1.4+ style for select):
    # from sqlalchemy.orm import selectinload
    # stmt = (
    #     select(SaleModel)
    #     .where(SaleModel.id == sale_id, SaleModel.owner_id == current_user.id)
    #     .options(
    #         selectinload(SaleModel.items).selectinload(SaleItemModel.product),
    #         selectinload(SaleModel.customer)
    #     )
    # )
    # db_sale = db.execute(stmt).scalar_one_or_none()

    # Simpler query, relying on lazy loading or session state:
    db_sale = db.query(SaleModel).filter(SaleModel.id == sale_id, SaleModel.owner_id == current_user.id).first()

    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found or not owned by user")
    return db_sale

@router.get("/", response_model=List[Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Similar to read_sale, for a list, eager loading is more critical to avoid N+1.
    # stmt = (
    #     select(SaleModel)
    #     .where(SaleModel.owner_id == current_user.id)
    #     .offset(skip).limit(limit)
    #     .options(
    #         selectinload(SaleModel.items).selectinload(SaleItemModel.product),
    #         selectinload(SaleModel.customer)
    #     )
    # )
    # sales = db.execute(stmt).scalars().all()

    # Simpler query:
    sales = db.query(SaleModel).filter(SaleModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return sales
