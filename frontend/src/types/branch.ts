export interface Branch {
  id: number;
  name: string;
  address?: string | null;
  // Add other fields if your backend Branch schema returns more for display
}

export interface BranchCreateData {
  name: string;
  address?: string | null;
}

export interface BranchUpdateData {
  name?: string;
  address?: string | null;
}
