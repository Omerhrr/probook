import { Account } from './account';
import { Branch } from './branch';
import { User } from './user'; // Assuming a basic User type for created_by

// For individual items within a journal entry when creating
export interface JournalEntryItemCreateData {
  account_id: number;
  debit_amount?: number; // Backend defaults to 0.0 if not provided
  credit_amount?: number; // Backend defaults to 0.0 if not provided
  description?: string | null;
}

// For individual items within a journal entry when displaying (received from backend)
export interface JournalEntryItem {
  id: number;
  account_id: number;
  debit_amount: number;
  credit_amount: number;
  description?: string | null;
  account?: Account; // Nested account details for display
}

// For creating a new Journal Entry (to be sent to backend)
export interface JournalEntryCreateData {
  entry_date: string; // ISO date string "YYYY-MM-DD"
  description: string;
  branch_id: number;
  items: JournalEntryItemCreateData[];
}

// For a full Journal Entry record (as received from backend for display)
export interface JournalEntry {
  id: number;
  entry_date: string; // ISO date string
  description: string;
  branch_id: number;
  created_by_user_id?: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string

  items: JournalEntryItem[];
  branch?: Branch; // Nested branch details
  created_by?: User | null; // Nested user details (creator)
}
