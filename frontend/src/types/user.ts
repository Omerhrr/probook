import { Role } from './role';
import { Branch } from './branch';

// User object as expected in AuthContext and from /users/me
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  disabled?: boolean;
  role: Role; // Nested Role object
  branch?: Branch | null; // Optional nested Branch object
}

// For creating users via admin panel (includes password, role_id, branch_id)
export interface UserCreateDataAdmin {
  username: string;
  email: string;
  password: string;
  full_name?: string | null;
  role_id: number;
  branch_id?: number | null;
  disabled?: boolean; // Admin might set this on creation
}

// For updating users via admin panel
export interface UserUpdateDataAdmin {
  username?: string;
  email?: string;
  password?: string | null; // Password can be optional on update
  full_name?: string | null;
  role_id?: number;
  branch_id?: number | null;
  disabled?: boolean;
}

// Basic Login Credentials (if needed elsewhere, or can be inline)
export interface LoginCredentials {
  username: string;
  password: string;
}

// This was the previous User schema in schemas/user.py (backend) for reference
// class User(UserBase):
//     id: int
//     disabled: bool
//     role: RoleSchema # Nested Role information
//     branch: Optional[BranchSchema] = None # Nested Branch information, optional
// This frontend type aligns with that.
