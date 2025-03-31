
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
        // Use raw SQL query to check if tables exist
        const { data: tablesData, error: sqlError } = await supabase.rpc('create_audit_table');
        if (sqlError) console.error("Error creating audit table:", sqlError);
        
        const { data: rolesData, error: rolesError } = await supabase.rpc('create_custom_roles_table');
        if (rolesError) console.error("Error creating custom roles table:", rolesError);
        
        const { data: settingsData, error: settingsError } = await supabase.rpc('create_system_settings_table');
        if (settingsError) console.error("Error creating system settings table:", settingsError);
        
        console.log("Database setup completed");
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
