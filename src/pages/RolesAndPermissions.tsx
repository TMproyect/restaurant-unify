
import React from "react";
import Layout from "@/components/layout/Layout";
import RolesAndPermissions from "@/components/settings/RolesAndPermissions";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";

const RolesAndPermissionsPage = () => {
  const { user, isLoading } = useAuth();
  const { isAdmin } = useAdmin();
  
  console.log("RolesAndPermissions page loading. isAdmin:", isAdmin, "user:", user?.role);
  
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
