
import React from 'react';
import Layout from '@/components/layout/Layout';
import TemporaryRoleManager from '@/components/settings/TemporaryRoleManager';
import { usePermissions } from '@/hooks/use-permissions';
import { Navigate } from 'react-router-dom';
import PermissionGuard from '@/components/guards/PermissionGuard';

const TemporaryRolesPage: React.FC = () => {
  const { isAdmin } = usePermissions();
  
  return (
    <Layout>
      <PermissionGuard requiredPermission="settings.roles" fallbackPath="/dashboard" showError={true}>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Gestión de Roles Temporales</h1>
          <p className="text-muted-foreground">
            Asigna roles temporales a usuarios para accesos limitados por tiempo
          </p>
          
          <TemporaryRoleManager />
        </div>
      </PermissionGuard>
    </Layout>
  );
};

export default TemporaryRolesPage;
