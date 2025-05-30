import { Supplier } from './supplier'; // Assuming Supplier type is already defined

import { Branch } from './branch'; // For nested branch display

export interface Expense {
  id: number;
  expense_date: string;
  category: string;
  description?: string | null;
  amount: number;
  supplier_id?: number | null;
  owner_id: number;
  branch_id: number; // Added
  supplier?: Supplier | null;
  branch?: Branch | null; // Added
}

export interface ExpenseCreateData {
  expense_date?: string | null;
  category: string;
  description?: string | null;
  amount: number;
  supplier_id?: number | null;
  branch_id: number; // Added: must be specified on creation
}

export interface ExpenseUpdateData {
  expense_date?: string | null;
  branch_id?: number | null; // Added
  category?: string;
  description?: string | null;
  amount?: number;
  supplier_id?: number | null;
}
