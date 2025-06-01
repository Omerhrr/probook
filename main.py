from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import engine, Base
# Import all models to ensure Base knows about them for create_all
from models.user import User as UserModel
from models.role import Role as RoleModel # Import Role model
from models.branch import Branch as BranchModel # Import Branch model
from models.product import Product as ProductModel
from models.supplier import Supplier as SupplierModel
from models.customer import Customer as CustomerModel
from models.sale import Sale as SaleModel, SaleItem as SaleItemModel
from models.expense import Expense as ExpenseModel
# AccountTypeModel is already imported below for seeding
from models.account import Account as AccountModel
from models.journal_entry import JournalEntry as JournalEntryModel
from models.journal_entry import JournalEntryItem as JournalEntryItemModel
from models.accounting_setting import AccountingSetting as AccountingSettingModel
from models.customer_payment import CustomerPayment as CustomerPaymentModel
from models.purchase_order import PurchaseOrder as PurchaseOrderModel
from models.purchase_order import PurchaseOrderItem as PurchaseOrderItemModel
from models.supplier_payment import SupplierPayment as SupplierPaymentModel # Import SupplierPayment

from schemas.user import User as UserSchema
from routers import auth, products, suppliers, customers, sales, expenses, reports
from routers import roles as roles_router
from routers import branches as branches_router
from routers import users as users_router
from routers import account_types as account_types_router
from routers import accounts as accounts_router
from routers import journal_entries as journal_entries_router
from routers import accounting_settings as accounting_settings_router
from routers import customer_payments as customer_payments_router
from routers import purchase_orders as purchase_orders_router
from routers import supplier_payments as supplier_payments_router # Import supplier_payments router
from dependencies import get_current_active_user

from sqlalchemy.orm import Session
# RoleModel is already imported below for seeding
from database import SessionLocal # Import SessionLocal for seeding

# Function to seed initial roles
def seed_initial_roles(db: Session):
    initial_roles = [
        {"name": "admin", "description": "Administrator with full access"},
        {"name": "branch_manager", "description": "Manages a specific branch and its operations"},
        # Add other essential roles here if needed, e.g., "sales_person"
    ]
    for role_data in initial_roles:
        db_role = db.query(RoleModel).filter(RoleModel.name == role_data["name"]).first()
        if not db_role:
            new_role = RoleModel(name=role_data["name"], description=role_data["description"])
            db.add(new_role)
    db.commit()

# Function to seed initial account types
from models.account_type import AccountType as AccountTypeModel # Import AccountType model

def seed_initial_account_types(db: Session):
    initial_account_types = [
        {"name": "Asset", "description": "Resources owned by the company."},
        {"name": "Liability", "description": "Obligations of the company to others."},
        {"name": "Equity", "description": "Owner's stake in the company."},
        {"name": "Revenue", "description": "Income generated from business operations."},
        {"name": "Expense", "description": "Costs incurred in business operations."}
    ]
    for acc_type_data in initial_account_types:
        db_acc_type = db.query(AccountTypeModel).filter(AccountTypeModel.name == acc_type_data["name"]).first()
        if not db_acc_type:
            new_acc_type = AccountTypeModel(name=acc_type_data["name"], description=acc_type_data["description"])
            db.add(new_acc_type)
    db.commit()


# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    db = SessionLocal()
    try:
        seed_initial_roles(db)
        seed_initial_account_types(db) # Add account type seeding
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(suppliers.router)
app.include_router(customers.router)
app.include_router(sales.router)
app.include_router(expenses.router)
app.include_router(reports.router)
app.include_router(roles_router.router) # Use the imported router objects
app.include_router(branches_router.router)
app.include_router(users_router.router)
app.include_router(account_types_router.router)
app.include_router(accounts_router.router)
app.include_router(journal_entries_router.router)
app.include_router(accounting_settings_router.router)
app.include_router(customer_payments_router.router)
app.include_router(purchase_orders_router.router)
app.include_router(supplier_payments_router.router) # Register supplier_payments router


@app.get("/users/me/", response_model=UserSchema)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user
