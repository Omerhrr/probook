import { Supplier } from './supplier'; // Assuming supplier types will be defined later or are simple for now

export interface Product {
  id: number;
  code: string;
  name: string;
  category?: string | null;
  purchase_date?: string | null; // Dates are often strings in JSON
  selling_price: number;
  purchase_price?: number | null;
  supplier_id?: number | null;
  opening_stock?: number;
  owner_id: number;
  supplier?: Supplier | null; // Assuming a nested Supplier object might be returned
}

export interface ProductCreateData {
  code: string;
  name: string;
  category?: string | null;
  purchase_date?: string | null; // ISO date string
  selling_price: number;
  purchase_price?: number | null;
  supplier_id?: number | null;
  opening_stock?: number;
}

// ProductUpdate can often be a Partial of ProductCreateData
// or have specific fields that are updatable
export interface ProductUpdateData {
  code?: string;
  name?: string;
  category?: string | null;
  purchase_date?: string | null;
  selling_price?: number;
  purchase_price?: number | null;
  supplier_id?: number | null;
  opening_stock?: number;
}

// For API responses that might include pagination
export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  size: number;
}

// If your backend returns a simple list for getProducts
// you might not need PaginatedProducts immediately.
// The current backend returns List[Product], not paginated object.
// So, getProducts will return Product[].
// We can add pagination to the backend later if needed.
