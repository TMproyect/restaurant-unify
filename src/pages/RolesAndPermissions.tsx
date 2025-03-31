
import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import RolesAndPermissions from "@/components/settings/RolesAndPermissions";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";

const RolesAndPermissionsPage = () => {
  const { user, isLoading } = useAuth();
  const { isAdmin } = useAdmin();
  
  console.log("RolesAndPermissions page loading. isAdmin:", isAdmin, "user:", user?.role);
  
  // Check and create necessary tables for audit logging
  useEffect(() => {
    const setupAuditLogging = async () => {
      if (!isAdmin) return;
      
      try {
        // Check if table exists
        const { data: existingTables, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .in('table_name', ['role_permission_audit_logs', 'custom_roles', 'system_settings']);
          
        if (tableError) {
          console.error("Error checking for existing tables:", tableError);
          return;
        }
        
        const existingTableNames = (existingTables || []).map(t => t.table_name);
        
        // Create audit logs table if it doesn't exist
        if (!existingTableNames.includes('role_permission_audit_logs')) {
          const { error: createError } = await supabase.rpc('create_audit_table');
          if (createError) {
            console.error("Error creating audit table:", createError);
          } else {
            console.log("Audit table created successfully");
          }
        }
        
        // Create custom roles table if it doesn't exist
        if (!existingTableNames.includes('custom_roles')) {
          const { error: createError } = await supabase.rpc('create_custom_roles_table');
          if (createError) {
            console.error("Error creating custom roles table:", createError);
          } else {
            console.log("Custom roles table created successfully");
          }
        }
        
        // Create system settings table if it doesn't exist
        if (!existingTableNames.includes('system_settings')) {
          const { error: createError } = await supabase.rpc('create_system_settings_table');
          if (createError) {
            console.error("Error creating system settings table:", createError);
          } else {
            console.log("System settings table created successfully");
            
            // Add default setting for audit logging
            const { error: insertError } = await supabase
              .from('system_settings')
              .upsert({ key: 'enable_audit_logging', value: 'true' });
              
            if (insertError) {
              console.error("Error setting default audit setting:", insertError);
            }
          }
        }
      } catch (error) {
        console.error("Error setting up audit logging:", error);
      }
    };
    
    setupAuditLogging();
  }, [isAdmin, user]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Cargando...</p>
        </div>
      </Layout>
    );
  }
  
  if (!isAdmin) {
    console.log("User doesn't have permission to access Roles and Permissions");
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Roles y Permisos</h1>
        <RolesAndPermissions />
      </div>
    </Layout>
  );
};

export default RolesAndPermissionsPage;
