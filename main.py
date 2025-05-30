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
from models.supplier import Supplier as SupplierModel # Import Supplier model
from models.customer import Customer as CustomerModel
from models.sale import Sale as SaleModel, SaleItem as SaleItemModel
from models.expense import Expense as ExpenseModel

from schemas.user import User as UserSchema
# Corrected router imports
from routers import auth, products, suppliers, customers, sales, expenses, reports
from routers import roles as roles_router
from routers import branches as branches_router
from routers import users as users_router
from dependencies import get_current_active_user

from sqlalchemy.orm import Session
from models.role import Role as RoleModel # Import Role model for seeding
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

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    # This is a simple way to run seeding.
    # For more complex scenarios or if async session is needed, adjust accordingly.
    db = SessionLocal()
    try:
        seed_initial_roles(db)
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


@app.get("/users/me/", response_model=UserSchema)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user
