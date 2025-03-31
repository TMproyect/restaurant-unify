
import React from "react";
import Layout from "@/components/layout/Layout";
import RolesAndPermissions from "@/components/settings/RolesAndPermissions";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Navigate } from "react-router-dom";

const RolesAndPermissionsPage = () => {
  const { user, isLoading } = useAuth();
  
  // Check if user has permission to access this page
  const hasAccess = user && (user.role === "admin" || user.role === "owner");
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Cargando...</p>
        </div>
      </Layout>
    );
  }
  
  if (!hasAccess) {
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
