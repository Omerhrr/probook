import { Branch } from './branch';
import { Account } from './account'; // Using the full Account type for detailed display

// Define known accounting setting keys as a string literal union for type safety
export const KnownAccountingSettingKeys = [
  "default_sales_revenue_account_id",
  "default_accounts_receivable_account_id",
  "default_cogs_account_id",
  "default_inventory_account_id",
  "default_cash_on_hand_account_id",
  // Add other keys as they are defined and needed
  // "default_supplier_payable_account_id",
  // "default_vat_payable_account_id",
  // "default_bank_account_id",
] as const;

export type AccountingSettingKey = typeof KnownAccountingSettingKeys[number];

export interface AccountingSetting {
  id: number;
  branch_id: number;
  key: AccountingSettingKey | string; // Allow string for flexibility if backend adds new keys not yet in frontend type
  value_account_id: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string

  branch?: Branch;   // Nested branch details
  account?: Account; // Nested account details for the value_account_id
}

export interface AccountingSettingCreateData {
  branch_id: number;
  key: AccountingSettingKey | string;
  value_account_id: number;
}

// For updating, usually only the value_account_id is changed for a given key and branch.
// The backend POST is an upsert, so create can be used for update if key+branch matches.
// A dedicated PUT might only allow value_account_id to change.
export interface AccountingSettingUpdateData {
  value_account_id: number;
}

// Helper type for the form state, mapping keys to their account_id values
export type AccountingSettingsFormData = {
    [K in AccountingSettingKey]?: number | null;
};
