import { Product } from './product';
import { Customer } from './customer';

// For individual items within a sale
export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product; // Product details, usually populated for display
  sale_id: number; // Backend schema has this
}

// For creating a new sale item (to be sent to backend)
export interface SaleItemCreateData {
  product_id: number;
  quantity: number;
  unit_price?: number | null; // Optional: if not provided, backend might use product's current price
}

// For a full Sale record (as received from backend)
export interface Sale {
  id: number;
  sale_date: string; // ISO date string
  customer_id?: number | null;
  total_amount: number;
  user_id: number; // User who made the sale
  owner_id: number;
  items: SaleItem[];
  customer?: Customer | null; // Customer details, populated for display
  // user?: User; // Details of user who made the sale, if needed (define User type)
}

// For creating a new Sale (to be sent to backend)
export interface SaleCreateData {
  customer_id?: number | null;
  items: SaleItemCreateData[];
  // sale_date and total_amount are usually handled by backend
  // user_id and owner_id also handled by backend based on authenticated user
}

// Minimal user detail if needed for display (e.g. seller name)
// This should ideally be in a types/user.ts if more details are needed
export interface BasicUser {
    id: number;
    username: string;
    // email?: string;
    // full_name?: string;
}

// Update Sale if needed (though typically not a primary feature)
// export interface SaleUpdateData { ... }
