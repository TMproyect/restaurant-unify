
import { supabase } from "@/integrations/supabase/client";
import { CustomRole, SystemSetting, RolePermissionAuditLog } from "@/contexts/auth/types";
import { mapSingleResponse, mapArrayResponse } from "@/utils/supabaseHelpers";

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
    
    // Query custom_roles table with type assertion
    const { data, error } = await supabase
      .from('custom_roles' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching custom roles directly:", error);
      return [];
    }
    
    // Convert results to CustomRole type
    const roles: CustomRole[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      permissions: item.permissions || {},
      created_at: item.created_at
    }));
    
    console.log("Got custom roles:", roles.length);
    return roles;
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    return [];
  }
}

// Upsert (update or insert) a custom role
export async function upsertCustomRole(role: Partial<CustomRole>): Promise<boolean> {
  try {
    console.log("Upserting custom role:", role.name);
    
    // Ensure we have valid permissions object
    const safePermissions = role.permissions || {};
    
    // Upsert the role directly to custom_roles table with type assertion
    const { error } = await supabase
      .from('custom_roles' as any)
      .upsert({
        name: role.name,
        description: role.description || '',
        permissions: safePermissions
      } as any, { 
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
    
    // Get the setting directly from system_settings table with type assertion
    const { data, error } = await supabase
      .from('system_settings' as any)
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
    
    const result = data as any;
    console.log(`Got system setting ${key}:`, result?.value);
    return result?.value || null;
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
    
    // Insert directly to role_permission_audit_logs table with type assertion
    const { error } = await supabase
      .from('role_permission_audit_logs' as any)
      .insert({
        user_id: userId,
        user_name: userName,
        role_name: roleName,
        permission_id: permissionId,
        permission_name: permissionName,
        previous_value: previousValue,
        new_value: newValue
      } as any);
    
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
    
    // Get logs directly from role_permission_audit_logs table with type assertion
    const { data, error } = await supabase
      .from('role_permission_audit_logs' as any)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} audit logs`);
    return data as unknown as RolePermissionAuditLog[];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

// Create database tables and functions via direct API call
export async function setupDatabaseFunctions(): Promise<void> {
  // Tables should already exist via SQL migration
  console.log("Database tables have been created via SQL migration");
}
