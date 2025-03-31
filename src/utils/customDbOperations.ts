
import { supabase } from "@/integrations/supabase/client";
import { CustomRole, SystemSetting, RolePermissionAuditLog } from "@/contexts/auth/types";

// Helper function to safely parse JSON response
function parseJsonResponse<T>(data: any): T[] {
  if (!data || typeof data !== 'object') return [];
  
  try {
    if (Array.isArray(data)) {
      return data as T[];
    } else {
      return [data] as T[];
    }
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return [];
  }
}

// Get custom roles from database
export async function getCustomRoles(): Promise<CustomRole[]> {
  try {
    // Use raw SQL via exec_sql RPC
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT * FROM custom_roles ORDER BY created_at DESC' 
    });
    
    if (error) {
      console.error("Error executing SQL for custom roles:", error);
      return [];
    }
    
    return parseJsonResponse<CustomRole>(data);
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    return [];
  }
}

// Upsert (update or insert) a custom role
export async function upsertCustomRole(role: Partial<CustomRole>): Promise<boolean> {
  try {
    const sql = `
      INSERT INTO custom_roles (name, description, permissions)
      VALUES ('${role.name}', '${role.description || ''}', '${JSON.stringify(role.permissions || {})}')
      ON CONFLICT (name) 
      DO UPDATE SET 
        description = '${role.description || ''}',
        permissions = '${JSON.stringify(role.permissions || {})}'
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error("Error executing SQL for upserting custom role:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error upserting custom role:', error);
    return false;
  }
}

// Get a system setting by key
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const sql = `SELECT value FROM system_settings WHERE key = '${key}'`;
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
    
    // Handle the SQL result which might be an array of rows
    const rows = parseJsonResponse<{ value: string }>(data);
    
    if (rows.length > 0 && rows[0] && rows[0].value) {
      return rows[0].value;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting system setting ${key}:`, error);
    return null;
  }
}

// Log permission changes for audit trail
export async function logPermissionChange(
  userId: string,
  userName: string,
  roleName: string,
  permissionId: string,
  permissionName: string,
  previousValue: boolean,
  newValue: boolean
): Promise<boolean> {
  try {
    const sql = `
      INSERT INTO role_permission_audit_logs
      (user_id, user_name, role_name, permission_id, permission_name, previous_value, new_value)
      VALUES (
        '${userId}', 
        '${userName}', 
        '${roleName}', 
        '${permissionId}', 
        '${permissionName}', 
        ${previousValue}, 
        ${newValue}
      )
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error("Error logging permission change via SQL:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error logging permission change:', error);
    return false;
  }
}

// Get audit logs for permission changes
export async function getAuditLogs(): Promise<RolePermissionAuditLog[]> {
  try {
    const sql = 'SELECT * FROM role_permission_audit_logs ORDER BY timestamp DESC LIMIT 100';
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error("Error fetching audit logs via SQL:", error);
      return [];
    }
    
    return parseJsonResponse<RolePermissionAuditLog>(data);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

// Create database tables and functions via SQL
export async function setupDatabaseFunctions(): Promise<void> {
  const createTablesSQL = `
    -- Create custom_roles table if not exists
    CREATE TABLE IF NOT EXISTS public.custom_roles (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      permissions JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Create system_settings table if not exists
    CREATE TABLE IF NOT EXISTS public.system_settings (
      key TEXT NOT NULL PRIMARY KEY,
      value TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Create role_permission_audit_logs table if not exists
    CREATE TABLE IF NOT EXISTS public.role_permission_audit_logs (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      user_name TEXT NOT NULL,
      role_name TEXT NOT NULL,
      permission_id TEXT NOT NULL,
      permission_name TEXT NOT NULL,
      previous_value BOOLEAN NOT NULL,
      new_value BOOLEAN NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    if (error) {
      console.error("Error setting up database tables:", error);
    } else {
      console.log("Successfully set up database tables");
    }
  } catch (error) {
    console.error("Error executing SQL for table setup:", error);
  }
}

// Helper function to execute SQL if admin
export async function execAdminSQL(sql: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error executing SQL:", error);
    return null;
  }
}
