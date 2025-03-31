
import { supabase } from "@/integrations/supabase/client";
import { CustomRole, SystemSetting } from "@/contexts/auth/types";

export async function getCustomRoles(): Promise<CustomRole[]> {
  // Use raw SQL query to get custom roles
  const { data, error } = await supabase.rpc('get_custom_roles');
  
  if (error) {
    console.error("Error fetching custom roles:", error);
    
    // Fallback to direct query if RPC doesn't exist
    const { data: directData, error: directError } = await supabase
      .from('custom_roles')
      .select('*');
    
    if (directError) {
      console.error("Error in direct query:", directError);
      return [];
    }
    
    return directData || [];
  }
  
  return data || [];
}

export async function upsertCustomRole(role: Partial<CustomRole>): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('upsert_custom_role', {
      p_name: role.name,
      p_description: role.description || '',
      p_permissions: role.permissions || {}
    });
  
  if (error) {
    console.error("Error upserting custom role via RPC:", error);
    
    // Fallback to direct query
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
  }
  
  return true;
}

export async function getSystemSetting(key: string): Promise<string | null> {
  // Use raw SQL to get setting
  const { data, error } = await supabase
    .rpc('get_system_setting', { p_key: key });
  
  if (error) {
    console.error(`Error fetching setting ${key}:`, error);
    
    // Fallback to direct query
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
  }
  
  return data;
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
  // Use raw SQL to log change
  const { data, error } = await supabase.rpc('log_permission_change', {
    p_user_id: userId,
    p_user_name: userName,
    p_role_name: roleName,
    p_permission_id: permissionId,
    p_permission_name: permissionName,
    p_previous_value: previousValue,
    p_new_value: newValue
  });
  
  if (error) {
    console.error("Error logging permission change via RPC:", error);
    
    // Fallback to direct insert
    const { error: directError } = await supabase
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
    
    if (directError) {
      console.error("Error in direct insert:", directError);
      return false;
    }
  }
  
  return true;
}

export async function getAuditLogs(): Promise<any[]> {
  // Use raw SQL to get audit logs
  const { data, error } = await supabase.rpc('get_audit_logs');
  
  if (error) {
    console.error("Error fetching audit logs via RPC:", error);
    
    // Fallback to direct query
    const { data: directData, error: directError } = await supabase
      .from('role_permission_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (directError) {
      console.error("Error in direct query:", directError);
      return [];
    }
    
    return directData || [];
  }
  
  return data || [];
}

// Create database functions via SQL if they don't exist
export async function setupDatabaseFunctions(): Promise<void> {
  const createFunctionsSQL = `
    -- Create function to get custom roles
    CREATE OR REPLACE FUNCTION public.get_custom_roles()
    RETURNS SETOF custom_roles
    LANGUAGE sql
    SECURITY DEFINER
    AS $function$
      SELECT * FROM public.custom_roles ORDER BY created_at DESC;
    $function$;
    
    -- Create function to upsert custom role
    CREATE OR REPLACE FUNCTION public.upsert_custom_role(
      p_name TEXT,
      p_description TEXT,
      p_permissions JSONB
    )
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    BEGIN
      INSERT INTO public.custom_roles (name, description, permissions)
      VALUES (p_name, p_description, p_permissions)
      ON CONFLICT (name) 
      DO UPDATE SET 
        description = p_description,
        permissions = p_permissions;
      RETURN TRUE;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN FALSE;
    END;
    $function$;
    
    -- Create function to get system setting
    CREATE OR REPLACE FUNCTION public.get_system_setting(p_key TEXT)
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    DECLARE
      v_value TEXT;
    BEGIN
      SELECT value INTO v_value FROM public.system_settings WHERE key = p_key;
      RETURN v_value;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN NULL;
    END;
    $function$;
    
    -- Create function to log permission change
    CREATE OR REPLACE FUNCTION public.log_permission_change(
      p_user_id UUID,
      p_user_name TEXT,
      p_role_name TEXT,
      p_permission_id TEXT,
      p_permission_name TEXT,
      p_previous_value BOOLEAN,
      p_new_value BOOLEAN
    )
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    BEGIN
      INSERT INTO public.role_permission_audit_logs (
        user_id, user_name, role_name, permission_id, 
        permission_name, previous_value, new_value
      )
      VALUES (
        p_user_id, p_user_name, p_role_name, p_permission_id,
        p_permission_name, p_previous_value, p_new_value
      );
      RETURN TRUE;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN FALSE;
    END;
    $function$;
    
    -- Create function to get audit logs
    CREATE OR REPLACE FUNCTION public.get_audit_logs()
    RETURNS SETOF role_permission_audit_logs
    LANGUAGE sql
    SECURITY DEFINER
    AS $function$
      SELECT * FROM public.role_permission_audit_logs 
      ORDER BY timestamp DESC LIMIT 100;
    $function$;
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: createFunctionsSQL });
  if (error) {
    console.error("Error setting up database functions:", error);
    
    // Try individual SQL queries through supabase.rpc if available
    const { error: execError } = await supabase.rpc('setup_roles_functions');
    if (execError) {
      console.error("Error setting up functions via RPC:", execError);
    }
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
