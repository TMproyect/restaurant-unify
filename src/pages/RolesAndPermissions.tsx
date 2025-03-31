
import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import RolesAndPermissions from "@/components/settings/RolesAndPermissions";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { setupDatabaseFunctions } from "@/utils/customDbOperations";

const RolesAndPermissionsPage = () => {
  const { user, isLoading } = useAuth();
  const { isAdmin } = useAdmin();
  
  console.log("RolesAndPermissions page loading. isAdmin:", isAdmin, "user:", user?.role);
  
  // Check and create necessary tables for audit logging
  useEffect(() => {
    const setupAuditLogging = async () => {
      if (!isAdmin) return;
      
      try {
        // Use our custom function to ensure tables exist
        await setupDatabaseFunctions();
        
        // Initialize audit logging setting
        await supabase.from('system_settings')
          .upsert({ key: 'enable_audit_logging', value: 'true' }, { 
            onConflict: 'key',
            ignoreDuplicates: true
          });
        
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
