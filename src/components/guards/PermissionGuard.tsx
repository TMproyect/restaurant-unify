
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '@/contexts/auth/AuthContext';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: string;
  fallbackPath?: string;
}

/**
 * Guard component that only renders children if user has the required permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard'
}) => {
  const { hasPermission } = usePermissions();
  const { isAuthenticated, isLoading } = useAuth();
  
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
  
  if (!hasPermission(requiredPermission)) {
    console.warn(`Access denied: Missing permission "${requiredPermission}"`);
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
