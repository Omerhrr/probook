import { AccountType } from './accountType';
import { Branch } from './branch';

export interface Account {
  id: number;
  name: string;
  account_code?: string | null;
  description?: string | null;
  account_type_id: number;
  branch_id: number;
  is_active: boolean;
  parent_account_id?: number | null;

  // Nested data for display
  account_type?: AccountType; // From backend Account schema
  branch?: Branch;         // From backend Account schema
  parent?: Account | null; // For displaying parent name, if fetched
  // children are usually not fetched in list views or basic forms to avoid large data
}

export interface AccountCreateData {
  name: string;
  account_code?: string | null;
  description?: string | null;
  account_type_id: number;
  branch_id: number;
  is_active?: boolean; // Defaults to true on backend
  parent_account_id?: number | null;
}

export interface AccountUpdateData {
  name?: string;
  account_code?: string | null;
  description?: string | null;
  account_type_id?: number;
  branch_id?: number; // Admin might change this
  is_active?: boolean;
  parent_account_id?: number | null;
}

// For Autocomplete options, e.g., parent account selection
export interface AccountLookup {
    id: number;
    name: string;
    account_code?: string | null;
    branch_id: number; // To filter by branch
}
