from sqlalchemy.orm import Session, selectinload
from typing import Dict
import models.accounting_setting as setting_model
from fastapi import HTTPException

# Define standard keys for essential accounts
# These should be consistently used when creating/querying settings.
ESSENTIAL_ACCOUNT_KEYS = [
    "default_sales_revenue_account_id",
    "default_accounts_receivable_account_id",
    "default_cogs_account_id",
    "default_inventory_account_id",
    "default_cash_on_hand_account_id", # For cash sales/payments
    # Add other essential accounts like general expense, specific payments, etc.
]

def get_branch_accounting_settings(db: Session, branch_id: int) -> Dict[str, int]:
    """
    Fetches all accounting settings for a given branch and returns them as a dictionary.
    Also checks if all essential account settings are configured.
    """
    settings = db.query(setting_model.AccountingSetting).options(
        selectinload(setting_model.AccountingSetting.account) # Eager load account for validation if needed
    ).filter(setting_model.AccountingSetting.branch_id == branch_id).all()

    settings_dict: Dict[str, int] = {setting.key: setting.value_account_id for setting in settings}

    # Validate that all essential accounts are configured for this branch
    missing_keys = [key for key in ESSENTIAL_ACCOUNT_KEYS if key not in settings_dict]
    if missing_keys:
        raise HTTPException(
            status_code=500, # Internal Server Error, as this is a configuration issue
            detail=f"Accounting settings not fully configured for branch ID {branch_id}. Missing keys: {', '.join(missing_keys)}"
        )

    # Further validation: Check if the accounts linked by value_account_id are active and of correct type
    # This is more advanced and might be done here or when the setting is created/updated.
    # For example:
    # sales_rev_acc_id = settings_dict.get("default_sales_revenue_account_id")
    # if sales_rev_acc_id:
    #     sales_rev_account = db.query(AccountModel).filter(AccountModel.id == sales_rev_acc_id).first()
    #     if not sales_rev_account or not sales_rev_account.is_active:
    #         raise HTTPException(status_code=500, detail="Default Sales Revenue account is inactive or not found.")
    #     if sales_rev_account.account_type.name != "Revenue": # Assuming AccountType has a 'name'
    #         raise HTTPException(status_code=500, detail="Default Sales Revenue account is not of type 'Revenue'.")

    return settings_dict
