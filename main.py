from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import engine, Base # Removed get_db as it's not directly used here for table creation
from models.user import User as UserModel # Keep User model for existing /users/me endpoint
from models.product import Product as ProductModel # Import Product model
from models.customer import Customer as CustomerModel # Import Customer model
from models.sale import Sale as SaleModel, SaleItem as SaleItemModel # Import Sale models
from models.expense import Expense as ExpenseModel # Import Expense model
# No specific models needed for reports router in main.py unless used directly
from schemas.user import User as UserSchema
from routers import auth, products, suppliers, customers, sales, expenses, reports # Import reports router
from dependencies import get_current_active_user

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(products.router) # Include products router
app.include_router(suppliers.router) # Include suppliers router
app.include_router(customers.router) # Include customers router
app.include_router(sales.router) # Include sales router
app.include_router(expenses.router) # Include expenses router
app.include_router(reports.router) # Include reports router

@app.get("/users/me/", response_model=UserSchema)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user
