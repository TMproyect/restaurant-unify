
import { Session, User } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'admin' | 'gerente' | 'mesero' | 'cocina' | 'repartidor' | 'propietario';

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
  isCustom?: boolean;
  isSystem?: boolean;
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

// Define for audit logging
export interface RolePermissionAuditLog {
  id: string;
  userId: string;
  userName: string;
  roleName: UserRole;
  permissionId: string;
  permissionName: string;
  previousValue: boolean;
  newValue: boolean;
  timestamp: string;
}

// Define table types for Supabase
export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

