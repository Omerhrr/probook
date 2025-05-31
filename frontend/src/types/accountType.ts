export interface AccountType {
  id: number;
  name: string;
  description?: string | null;
}

export interface AccountTypeCreateData {
  name: string;
  description?: string | null;
}

export interface AccountTypeUpdateData {
  name?: string;
  description?: string | null;
}
