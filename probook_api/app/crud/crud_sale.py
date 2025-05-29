from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
import string

from app.models.models import Sale as SaleModel, SaleItem as SaleItemModel, Product as ProductModel
from app.schemas.sale_schemas import SaleCreate, SaleItemCreate
from app.crud import crud_product, crud_branch

def generate_invoice_number() -> str:
    now = datetime.utcnow()
    timestamp_str = now.strftime("%Y%m%d%H%M%S%f")[:-3] # Milliseconds
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"INV-{timestamp_str}-{random_str}"

def create_sale(db: Session, sale_in: SaleCreate, user_id: int) -> Optional[SaleModel]:
    # Validate branch_id
    branch = crud_branch.get_branch(db, branch_id=sale_in.branch_id)
    if not branch:
        raise ValueError(f"Invalid branch ID: {sale_in.branch_id}. Branch does not exist.")

    invoice_number = generate_invoice_number()
    total_sale_amount = 0.0
    
    # Temporary list to hold SaleItemModel data before SaleModel is created
    sale_item_data_list = []
    products_to_update = []

    for item_create_schema in sale_in.items:
        product = crud_product.get_product(db, product_id=item_create_schema.product_id)
        if not product:
            raise ValueError(f"Product with ID {item_create_schema.product_id} not found.")
        if product.stock_quantity < item_create_schema.quantity_sold:
            raise ValueError(
                f"Insufficient stock for product '{product.name}' (ID: {product.id}). "
                f"Available: {product.stock_quantity}, Requested: {item_create_schema.quantity_sold}"
            )

        item_total_price = product.selling_price * item_create_schema.quantity_sold
        total_sale_amount += item_total_price

        # Prepare SaleItem data
        sale_item_data_list.append({
            "product_id": product.id,
            "quantity_sold": item_create_schema.quantity_sold,
            "unit_price": product.selling_price, # Price at the time of sale
            "total_price_for_item": item_total_price,
        })
        
        # Prepare product for stock update
        product.stock_quantity -= item_create_schema.quantity_sold
        products_to_update.append(product)

    # Create SaleModel instance
    db_sale = SaleModel(
        invoice_number=invoice_number,
        total_amount=total_sale_amount,
        user_id=user_id,
        branch_id=sale_in.branch_id,
        sale_date=datetime.utcnow() # Set sale_date at creation
    )
    db.add(db_sale)

    # Update product stocks
    for prod in products_to_update:
        db.add(prod) # Add product to session for stock update

    # After adding sale and products, flush to get db_sale.id for foreign keys
    # but don't commit yet.
    try:
        db.flush() 
    except Exception as e:
        db.rollback() # Rollback if flush fails
        raise ValueError(f"Error during flushing initial sale data: {str(e)}")


    # Create SaleItemModel instances now that db_sale.id is available
    for sid_data in sale_item_data_list:
        db_sale_item = SaleItemModel(
            sale_id=db_sale.id,
            product_id=sid_data["product_id"],
            quantity_sold=sid_data["quantity_sold"],
            unit_price=sid_data["unit_price"],
            total_price_for_item=sid_data["total_price_for_item"]
        )
        db.add(db_sale_item)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback() # Rollback if commit fails (e.g. concurrent modification)
        # More specific error handling or logging could be added here
        raise ValueError(f"Error during final commit of sale: {str(e)}")

    db.refresh(db_sale)
    # The items relationship should be automatically populated by SQLAlchemy
    return db_sale

def get_sale(db: Session, sale_id: int) -> Optional[SaleModel]:
    return db.query(SaleModel).filter(SaleModel.id == sale_id).first()

def get_sales(db: Session, skip: int = 0, limit: int = 100) -> List[SaleModel]:
    return db.query(SaleModel).order_by(SaleModel.sale_date.desc()).offset(skip).limit(limit).all()

def get_sales_by_branch(db: Session, branch_id: int, skip: int = 0, limit: int = 100) -> List[SaleModel]:
    return db.query(SaleModel).filter(SaleModel.branch_id == branch_id).order_by(SaleModel.sale_date.desc()).offset(skip).limit(limit).all()

def get_sales_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[SaleModel]:
    return db.query(SaleModel).filter(SaleModel.user_id == user_id).order_by(SaleModel.sale_date.desc()).offset(skip).limit(limit).all()
