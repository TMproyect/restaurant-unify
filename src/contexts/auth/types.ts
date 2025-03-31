import { Session, User } from '@supabase/supabase-js';

// Define user roles - solo incluir nombres en español
export type UserRole = 'admin' | 'gerente' | 'mesero' | 'cocina' | 'repartidor' | 'propietario';

// Update or add these types if not already present
export type PermissionCategory = 'dashboard' | 'orders' | 'tables' | 'kitchen' | 'cashier' | 'inventory' | 'reports' | 'staff' | 'settings';

export type Permission = {
  id: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  default: Record<UserRole, boolean>;
};

export type Role = {
  name: UserRole;
  description: string;
  permissions: Record<string, boolean>;
  userCount: number;
  isSystem?: boolean;
  isCustom?: boolean;
};

export type CustomRole = {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  created_at: string;
};

export type RolePermissionAuditLog = {
  id: string;
  user_id: string;
  user_name: string;
  role_name: string;
  permission_id: string;
  permission_name: string;
  previous_value: boolean;
  new_value: boolean;
  timestamp: string;
};

export type SystemSetting = {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

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
