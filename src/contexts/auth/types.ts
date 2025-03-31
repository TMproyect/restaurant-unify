
import { Session, User } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'delivery' | 'manager' | 'owner';

// Define permission categories
export type PermissionCategory = 
  | 'dashboard' 
  | 'orders' 
  | 'tables' 
  | 'kitchen' 
  | 'cashier' 
  | 'inventory' 
  | 'reports' 
  | 'staff' 
  | 'settings';

// Define permission structure
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  default: Record<UserRole, boolean>;
}

// Role with permissions
export interface Role {
  name: UserRole;
  description: string;
  permissions: Record<string, boolean>;
  userCount: number;
}

// Define user type
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  created_at?: string;
}

// Define auth context type
export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<any>; 
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<any>; 
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  createUser: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  fetchAllUsers: () => Promise<AuthUser[]>;
}
