export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  registration_date: string; // Dates are often strings in JSON (ISO format)
  owner_id: number;
}

import { Branch } from './branch'; // For potential nested branch display

export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  registration_date: string;
  owner_id: number;
  branch_id: number; // Added from backend schema
  branch?: Branch | null; // For display
}


export interface CustomerCreateData {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  branch_id: number; // Added: must be specified on creation
}

export interface CustomerUpdateData {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  branch_id?: number | null; // Optional: admin might change this
}
