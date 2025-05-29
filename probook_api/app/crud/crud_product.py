from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import Product as ProductModel
# SupplierModel and BranchModel are not directly used in adjust_product_stock but kept for other functions
from app.models.models import Supplier as SupplierModel 
from app.models.models import Branch as BranchModel
from app.schemas.product_schemas import ProductCreate, ProductUpdate, StockAdjustment # Imported StockAdjustment
from app.crud import crud_branch, crud_supplier # For validation

def get_product_by_code(db: Session, product_code: str) -> Optional[ProductModel]:
    return db.query(ProductModel).filter(ProductModel.product_code == product_code).first()

def adjust_product_stock(db: Session, product_db_obj: ProductModel, adjustment: StockAdjustment) -> ProductModel:
    new_stock = product_db_obj.stock_quantity + adjustment.adjustment_quantity
    if new_stock < 0:
        raise ValueError("Stock cannot be negative.")
    
    product_db_obj.stock_quantity = new_stock
    # Optional: Log reason: adjustment.reason
    
    db.add(product_db_obj)
    db.commit()
    db.refresh(product_db_obj)
    return product_db_obj

def create_product(db: Session, product: ProductCreate) -> Optional[ProductModel]:
    # Validate branch_id
    branch = crud_branch.get_branch(db, branch_id=product.branch_id)
    if not branch:
        return None # Branch validation failed

    # Validate supplier_id if provided
    if product.supplier_id is not None:
        supplier = crud_supplier.get_supplier(db, supplier_id=product.supplier_id)
        if not supplier:
            return None # Supplier validation failed

    # Check for product_code uniqueness (globally for this example)
    existing_product = get_product_by_code(db, product_code=product.product_code)
    if existing_product:
        return None # Product code not unique

    db_product = ProductModel(
        name=product.name,
        product_code=product.product_code,
        category=product.category,
        description=product.description,
        purchase_price=product.purchase_price,
        selling_price=product.selling_price,
        stock_quantity=product.stock_quantity,
        supplier_id=product.supplier_id,
        branch_id=product.branch_id,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product(db: Session, product_id: int) -> Optional[ProductModel]:
    return db.query(ProductModel).filter(ProductModel.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[ProductModel]:
    return db.query(ProductModel).offset(skip).limit(limit).all()

def get_products_by_branch(db: Session, branch_id: int, skip: int = 0, limit: int = 100) -> List[ProductModel]:
    return db.query(ProductModel).filter(ProductModel.branch_id == branch_id).offset(skip).limit(limit).all()

def get_products_by_supplier(db: Session, supplier_id: int, skip: int = 0, limit: int = 100) -> List[ProductModel]:
    return db.query(ProductModel).filter(ProductModel.supplier_id == supplier_id).offset(skip).limit(limit).all()

def update_product(db: Session, product_db_obj: ProductModel, product_in: ProductUpdate) -> Optional[ProductModel]:
    update_data = product_in.model_dump(exclude_unset=True)

    if "branch_id" in update_data and update_data["branch_id"] is not None:
        branch = crud_branch.get_branch(db, branch_id=update_data["branch_id"])
        if not branch:
            return None # New branch validation failed
    
    if "supplier_id" in update_data and update_data["supplier_id"] is not None:
        supplier = crud_supplier.get_supplier(db, supplier_id=update_data["supplier_id"])
        if not supplier:
            return None # New supplier validation failed
    # If supplier_id is explicitly set to None in product_in, allow unsetting
    elif "supplier_id" in update_data and update_data["supplier_id"] is None:
        pass # Allow unsetting supplier_id


    if "product_code" in update_data and update_data["product_code"] != product_db_obj.product_code:
        existing_product = get_product_by_code(db, product_code=update_data["product_code"])
        if existing_product and existing_product.id != product_db_obj.id:
            return None # New product code not unique

    for field, value in update_data.items():
        setattr(product_db_obj, field, value)
    
    db.add(product_db_obj)
    db.commit()
    db.refresh(product_db_obj)
    return product_db_obj

def delete_product(db: Session, product_id: int) -> Optional[ProductModel]:
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return db_product
    return None
