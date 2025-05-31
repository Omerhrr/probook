import { Customer } from './customer';
import { Branch } from './branch';
import { Account } from './account';
import { User } from './user'; // Assuming a User type for created_by

// Data for creating a new customer payment
export interface CustomerPaymentCreateData {
  payment_date: string; // ISO date string, e.g., "YYYY-MM-DD"
  customer_id: number;
  branch_id: number;
  amount_paid: number; // Frontend will send number, backend Pydantic handles condecimal
  payment_method_account_id: number;
  reference_number?: string | null;
  notes?: string | null;
}

// Data for updating a customer payment (limited fields)
export interface CustomerPaymentUpdateData {
  reference_number?: string | null;
  notes?: string | null;
  payment_date?: string; // ISO date string, if date correction is allowed
  // Amount paid is usually not updated; a reversal/new entry is preferred.
}

// Full customer payment object (e.g., for responses)
export interface CustomerPayment {
  id: number;
  payment_date: string; // ISO date string
  customer_id: number;
  branch_id: number;
  amount_paid: number;
  payment_method_account_id: number;
  reference_number?: string | null;
  notes?: string | null;
  created_by_user_id: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string

  // Nested objects for display
  customer?: Customer | null;
  branch?: Branch | null;
  payment_account?: Account | null; // The account used for payment (e.g., Cash, Bank)
  created_by?: User | null;    // User who recorded the payment
}
