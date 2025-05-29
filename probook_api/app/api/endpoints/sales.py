from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud import crud_sale, crud_branch, crud_product
from app.schemas.sale_schemas import Sale, SaleCreate
from app.db.session import get_db
from app.models.models import User
from app.core.security import get_current_active_user

router = APIRouter()

# Helper to get superuser, if needed for broader queries by admin
def get_superuser(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions. Superuser required."
        )
    return current_user

@router.post("/", response_model=Sale, status_code=status.HTTP_201_CREATED)
def create_new_sale(
    sale_in: SaleCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    try:
        # user_id for the sale is taken from the authenticated current_user
        created_sale = crud_sale.create_sale(db=db, sale_in=sale_in, user_id=current_user.id)
        if created_sale is None: # Should not happen if ValueError is raised correctly
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Failed to create sale due to an unexpected error in CRUD."
            )
        return created_sale
    except ValueError as e: # Catching ValueErrors from CRUD layer
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e: # Catch any other unexpected errors
        # Log the error e for server-side review
        print(f"Unexpected error creating sale: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the sale.",
        )


@router.get("/", response_model=List[Sale])
def read_all_sales(
    branch_id: Optional[int] = None,
    user_id_filter: Optional[int] = None, # Renamed to avoid clash with current_user.id
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sales_query_user_id = current_user.id # Default: user sees their own sales

    if current_user.is_superuser:
        if user_id_filter is not None:
            # Superuser is querying for a specific user's sales
            user_to_filter = crud_user.get_user(db, user_id=user_id_filter) # Assuming crud_user.get_user exists
            if not user_to_filter:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id_filter} not found.")
            sales_query_user_id = user_id_filter
        elif branch_id is not None:
            # Superuser is querying by branch, not restricted to a single user
            branch = crud_branch.get_branch(db, branch_id=branch_id)
            if not branch:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Branch with ID {branch_id} not found.")
            return crud_sale.get_sales_by_branch(db, branch_id=branch_id, skip=skip, limit=limit)
        else:
            # Superuser querying all sales (no user_id_filter or branch_id)
            return crud_sale.get_sales(db, skip=skip, limit=limit)
    else: # Not a superuser
        if user_id_filter is not None and user_id_filter != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view other users' sales.")
        # Non-superuser can only filter their own sales by branch_id if provided
        if branch_id is not None:
            branch = crud_branch.get_branch(db, branch_id=branch_id)
            if not branch:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Branch with ID {branch_id} not found.")
            # Further filter user's sales by this branch
            sales = crud_sale.get_sales_by_user_and_branch(db, user_id=current_user.id, branch_id=branch_id, skip=skip, limit=limit)
            # Assuming get_sales_by_user_and_branch exists or needs to be added to CRUD
            # For now, let's adjust: get user's sales, then filter by branch
            user_sales = crud_sale.get_sales_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
            return [s for s in user_sales if s.branch_id == branch_id]


    # If execution reaches here, it's either superuser querying for a specific user,
    # or a non-superuser querying their own sales (possibly filtered by branch already if logic adjusted)
    # This part needs refinement based on exact filtering requirements for non-superusers + branch_id
    if sales_query_user_id: # This will be true for non-superusers or superusers with user_id_filter
        return crud_sale.get_sales_by_user(db, user_id=sales_query_user_id, skip=skip, limit=limit)
    
    # Fallback for non-superuser if no branch_id filter was applied earlier
    # This path might be redundant if the above non-superuser logic is comprehensive
    return crud_sale.get_sales_by_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/{sale_id}", response_model=Sale)
def read_single_sale(
    sale_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    
    if not current_user.is_superuser and db_sale.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this sale")
        
    return db_sale
