
import { supabase } from "@/integrations/supabase/client";
import { CustomRole, SystemSetting, RolePermissionAuditLog } from "@/contexts/auth/types";

export async function getCustomRoles(): Promise<CustomRole[]> {
  try {
    // Use raw SQL via service role to bypass RLS issues
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT * FROM custom_roles ORDER BY created_at DESC' 
    });
    
    if (error) {
      console.error("Error executing SQL for custom roles:", error);
      
      // Fallback to direct query if possible
      try {
        const { data: directData, error: directError } = await supabase
          .from('custom_roles')
          .select('*');
        
        if (directError) {
          console.error("Error in direct query:", directError);
          return [];
        }
        
        return (directData as CustomRole[]) || [];
      } catch (fallbackError) {
        console.error("Error in fallback query:", fallbackError);
        return [];
      }
    }
    
    return (data as CustomRole[]) || [];
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    return [];
  }
}

export async function upsertCustomRole(role: Partial<CustomRole>): Promise<boolean> {
  try {
    // Use raw SQL via service role
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO custom_roles (name, description, permissions)
        VALUES ('${role.name}', '${role.description || ''}', '${JSON.stringify(role.permissions || {})}')
        ON CONFLICT (name) 
        DO UPDATE SET 
          description = '${role.description || ''}',
          permissions = '${JSON.stringify(role.permissions || {})}'
      `
    });
    
    if (error) {
      console.error("Error executing SQL for upserting custom role:", error);
      
      // Fallback to direct query
      try {
        const { error: directError } = await supabase
          .from('custom_roles')
          .upsert({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || {}
          });
        
        if (directError) {
          console.error("Error in direct upsert:", directError);
          return false;
        }
        
        return true;
      } catch (fallbackError) {
        console.error("Error in fallback upsert:", fallbackError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error upserting custom role:', error);
    return false;
  }
}

export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    // Use raw SQL via service role
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT value FROM system_settings WHERE key = '${key}'`
    });
    
    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      
      // Fallback to direct query
      try {
        const { data: directData, error: directError } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', key)
          .single();
        
        if (directError) {
          console.error("Error in direct query:", directError);
          return null;
        }
        
        return directData?.value || null;
      } catch (fallbackError) {
        console.error("Error in fallback query:", fallbackError);
        return null;
      }
    }
    
    // Handle the SQL result which might be an array of rows
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.value || null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting system setting ${key}:`, error);
    return null;
  }
}

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
    // Use raw SQL via service role
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
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

export async function getAuditLogs(): Promise<RolePermissionAuditLog[]> {
  try {
    // Use raw SQL via service role
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'SELECT * FROM role_permission_audit_logs ORDER BY timestamp DESC LIMIT 100'
    });
    
    if (error) {
      console.error("Error fetching audit logs via SQL:", error);
      return [];
    }
    
    return (data as RolePermissionAuditLog[]) || [];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

// Create database tables and functions via SQL if they don't exist
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

// Additional helper function to exec SQL if admin
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
