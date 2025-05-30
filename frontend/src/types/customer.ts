export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  registration_date: string; // Dates are often strings in JSON (ISO format)
  owner_id: number;
}

export interface CustomerCreateData {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  // registration_date is usually set by the backend
}

export interface CustomerUpdateData {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}
