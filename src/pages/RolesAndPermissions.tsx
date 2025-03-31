
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
  
  // Check and create necessary settings for audit logging
  useEffect(() => {
    const setupAuditLogging = async () => {
      if (!isAdmin) return;
      
      try {
        // Initialize audit logging setting using type assertion for system_settings table
        await supabase.from('system_settings' as any)
          .upsert({ 
            key: 'enable_audit_logging', 
            value: 'true',
            updated_at: new Date().toISOString()
          } as any, { 
            onConflict: 'key',
            ignoreDuplicates: false
          });
        
        console.log("Audit logging setting initialized");
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
