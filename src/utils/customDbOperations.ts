
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
    console.log("Fetching custom roles...");
    
    // Try direct query to custom_roles table
    const { data: directData, error: directError } = await supabase
      .from('custom_roles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (directError) {
      console.error("Error fetching custom roles directly:", directError);
      return [];
    }
    
    // Convert results to CustomRole type
    const roles: CustomRole[] = (directData || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      permissions: item.permissions || {},
      created_at: item.created_at
    }));
    
    console.log("Got custom roles:", roles);
    return roles;
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    return [];
  }
}

// Upsert (update or insert) a custom role
export async function upsertCustomRole(role: Partial<CustomRole>): Promise<boolean> {
  try {
    console.log("Upserting custom role:", role);
    
    // Upsert the role directly to custom_roles table
    const { error } = await supabase
      .from('custom_roles')
      .upsert({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || {}
      }, { 
        onConflict: 'name',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error("Error upserting custom role:", error);
      return false;
    }
    
    console.log("Custom role upserted successfully");
    return true;
  } catch (error) {
    console.error('Error upserting custom role:', error);
    return false;
  }
}

// Get a system setting by key
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    console.log(`Getting system setting for key: ${key}`);
    
    // Get the setting directly from system_settings table
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
    
    const value = data?.value;
    console.log(`Got system setting ${key}:`, value);
    return value || null;
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
    console.log(`Logging permission change for role ${roleName}, permission ${permissionName}`);
    
    // Insert directly to role_permission_audit_logs table
    const { error } = await supabase
      .from('role_permission_audit_logs')
      .insert({
        user_id: userId,
        user_name: userName,
        role_name: roleName,
        permission_id: permissionId,
        permission_name: permissionName,
        previous_value: previousValue,
        new_value: newValue
      });
    
    if (error) {
      console.error("Error logging permission change:", error);
      return false;
    }
    
    console.log("Permission change logged successfully");
    return true;
  } catch (error) {
    console.error('Error logging permission change:', error);
    return false;
  }
}

// Get audit logs for permission changes
export async function getAuditLogs(): Promise<RolePermissionAuditLog[]> {
  try {
    console.log("Getting audit logs...");
    
    // Get logs directly from role_permission_audit_logs table
    const { data, error } = await supabase
      .from('role_permission_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} audit logs`);
    return data as RolePermissionAuditLog[];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

// Create database tables and functions via SQL
export async function setupDatabaseFunctions(): Promise<void> {
  await createTables();
}

// Create the necessary database tables
async function createTables(): Promise<void> {
  try {
    console.log("Creating custom_roles table if not exists...");
    
    // Create custom_roles table
    const { error: rolesError } = await supabase.from('custom_roles').select('id').limit(1).single();
    if (rolesError && rolesError.code === '42P01') { // Table doesn't exist
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'apikey': process.env.SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          query: `
            CREATE TABLE IF NOT EXISTS public.custom_roles (
              id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              description TEXT,
              permissions JSONB NOT NULL DEFAULT '{}',
              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
          `
        })
      });
      console.log("Created custom_roles table");
    }
    
    console.log("Creating system_settings table if not exists...");
    
    // Create system_settings table
    const { error: settingsError } = await supabase.from('system_settings').select('key').limit(1).single();
    if (settingsError && settingsError.code === '42P01') { // Table doesn't exist
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'apikey': process.env.SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          query: `
            CREATE TABLE IF NOT EXISTS public.system_settings (
              key TEXT NOT NULL PRIMARY KEY,
              value TEXT,
              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
          `
        })
      });
      console.log("Created system_settings table");
    }
    
    console.log("Creating role_permission_audit_logs table if not exists...");
    
    // Create role_permission_audit_logs table
    const { error: logsError } = await supabase.from('role_permission_audit_logs').select('id').limit(1).single();
    if (logsError && logsError.code === '42P01') { // Table doesn't exist
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'apikey': process.env.SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          query: `
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
          `
        })
      });
      console.log("Created role_permission_audit_logs table");
    }
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// Helper function to execute SQL if admin
export async function execAdminSQL(sql: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'apikey': process.env.SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({ query: sql })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error executing SQL:", error);
    return null;
  }
}
