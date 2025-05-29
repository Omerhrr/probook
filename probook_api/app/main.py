from fastapi import FastAPI
from app.api.endpoints import auth as auth_endpoints
from app.api.endpoints import branches as branches_endpoints
from app.api.endpoints import suppliers as suppliers_endpoints
from app.api.endpoints import products as products_endpoints
from app.api.endpoints import sales as sales_endpoints

app = FastAPI(title="Probook API")

# Include the authentication router
app.include_router(auth_endpoints.router, prefix="/api/v1", tags=["auth"])
# Include the branches router
app.include_router(branches_endpoints.router, prefix="/api/v1/branches", tags=["branches"])
# Include the suppliers router
app.include_router(suppliers_endpoints.router, prefix="/api/v1/suppliers", tags=["suppliers"])
# Include the products router
app.include_router(products_endpoints.router, prefix="/api/v1/products", tags=["products"])
# Include the sales router
app.include_router(sales_endpoints.router, prefix="/api/v1/sales", tags=["sales"])

@app.get("/")
async def root():
    return {"message": "Probook API is running!"}
