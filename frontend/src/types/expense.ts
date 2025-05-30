import { Supplier } from './supplier'; // Assuming Supplier type is already defined

export interface Expense {
  id: number;
  expense_date: string; // ISO date string
  category: string;
  description?: string | null;
  amount: number;
  supplier_id?: number | null;
  owner_id: number;
  supplier?: Supplier | null; // Optional nested supplier details for display
}

export interface ExpenseCreateData {
  expense_date?: string | null; // Optional: backend defaults to now if not provided
  category: string;
  description?: string | null;
  amount: number;
  supplier_id?: number | null;
}

export interface ExpenseUpdateData {
  expense_date?: string | null;
  category?: string;
  description?: string | null;
  amount?: number;
  supplier_id?: number | null;
}
