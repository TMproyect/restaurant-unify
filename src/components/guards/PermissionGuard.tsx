
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { hasTemporaryRole } from '@/utils/temporaryRolesCache';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: string;
  fallbackPath?: string;
  showError?: boolean;
}

/**
 * Guard component that only renders children if user has the required permission
 * Now with support for temporary roles
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
  showError = false
}) => {
  const { hasPermission, temporaryRole, effectiveRole } = usePermissions();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required permission (includes check for temporary roles)
  const hasRequiredPermission = hasPermission(requiredPermission);
  
  if (!hasRequiredPermission) {
    console.warn(`Access denied: Missing permission "${requiredPermission}"`);
    console.log(`User role: ${user?.role}, Temporary role: ${temporaryRole}, Effective role: ${effectiveRole}`);
    
    if (showError) {
      return (
        <Alert variant="destructive" className="my-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permiso para acceder a esta sección. Se requiere el permiso: <strong>{requiredPermission}</strong>
          </AlertDescription>
        </Alert>
      );
    }
    
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
