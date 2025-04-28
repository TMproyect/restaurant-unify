
import { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { defaultPermissions } from '@/data/permissionsData';
import { 
  hasPermission as checkPermission,
  cacheUserPermissions,
  clearUserPermissionsCache,
  isRoleEqualOrInheritsFrom
} from '@/utils/permissionsCache';
import { Permission } from '@/contexts/auth/types';

/**
 * Custom hook for checking user permissions with caching for performance
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  // Generate cached permissions for current user upon mount
  useEffect(() => {
    if (user?.id && user?.role) {
      // Create default permissions object based on user's role
      const rolePermissions = defaultPermissions.reduce((acc, permission) => {
        // Check if permission has a default value for this role or parent roles
        let hasDefaultPermission = !!permission.default[user.role];
        
        // If not directly defined, check if any parent role has this permission
        if (!hasDefaultPermission) {
          Object.entries(permission.default).forEach(([role, value]) => {
            if (value && isRoleEqualOrInheritsFrom(user.role, role)) {
              hasDefaultPermission = true;
            }
          });
        }
        
        acc[permission.id] = hasDefaultPermission;
        return acc;
      }, {} as Record<string, boolean>);
      
      // Cache these permissions
      cacheUserPermissions(user.id, rolePermissions);
      
      // Clear cache on unmount
      return () => {
        clearUserPermissionsCache(user.id);
      };
    }
  }, [user?.id, user?.role]);
  
  // Callback for checking if user has permission
  const hasPermission = useCallback((
    permissionId: string,
    customPermissions?: Record<string, boolean>
  ): boolean => {
    if (!user?.id || !user?.role) return false;
    
    return checkPermission(
      user.id,
      user.role,
      permissionId,
      customPermissions
    );
  }, [user?.id, user?.role]);
  
  // Get all permissions for current role
  const rolePermissions = useMemo(() => {
    if (!user?.role) return {};
    
    return defaultPermissions.reduce((acc, permission) => {
      acc[permission.id] = !!permission.default[user.role];
      return acc;
    }, {} as Record<string, boolean>);
  }, [user?.role]);
  
  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    return defaultPermissions.reduce((groups, permission) => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }, []);
  
  return {
    hasPermission,
    rolePermissions,
    permissionsByCategory,
    isAdmin: user?.role === 'admin' || user?.role === 'propietario',
    isManager: user?.role === 'gerente' || isRoleEqualOrInheritsFrom(user?.role || '', 'gerente'),
    isCashier: user?.role === 'cajero' || isRoleEqualOrInheritsFrom(user?.role || '', 'cajero'),
    isKitchen: user?.role === 'cocina' || user?.role === 'kitchen' || 
              isRoleEqualOrInheritsFrom(user?.role || '', 'cocina'),
    isWaiter: user?.role === 'mesero' || isRoleEqualOrInheritsFrom(user?.role || '', 'mesero'),
    isDelivery: user?.role === 'repartidor' || user?.role === 'delivery' || 
               isRoleEqualOrInheritsFrom(user?.role || '', 'repartidor'),
  };
};

/**
 * Simple hook specifically for admin permission checks
 */
export const useAdmin = () => {
  const { user } = useAuth();
  return {
    isAdmin: user?.role === 'admin' || user?.role === 'propietario'
  };
};

/**
 * Simple hook specifically for kitchen permission checks
 */
export const useKitchenPermissions = () => {
  const { hasPermission } = usePermissions();
  
  return {
    hasViewPermission: hasPermission('kitchen.view'),
    hasManagePermission: hasPermission('kitchen.manage')
  };
};
