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
import { getTemporaryRole, hasTemporaryRole } from '@/utils/temporaryRolesCache';

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
  
  // Check for temporary role
  const temporaryRole = user?.id ? getTemporaryRole(user.id) : null;
  const effectiveRole = temporaryRole || user?.role;
  
  // Callback for checking if user has permission
  const hasPermission = useCallback((
    permissionId: string,
    customPermissions?: Record<string, boolean>
  ): boolean => {
    if (!user?.id || !effectiveRole) return false;
    
    // First check if the user has a temporary role with this permission
    if (temporaryRole) {
      // Find the permission
      const permission = defaultPermissions.find(p => p.id === permissionId);
      if (permission && permission.default[temporaryRole]) {
        return true;
      }
      
      // Check if any parent role of the temporary role has this permission
      for (const [role, value] of Object.entries(permission?.default || {})) {
        if (value && isRoleEqualOrInheritsFrom(temporaryRole, role)) {
          return true;
        }
      }
    }
    
    // Fall back to regular permission check
    return checkPermission(
      user.id,
      user.role,
      permissionId,
      customPermissions
    );
  }, [user?.id, user?.role, temporaryRole, effectiveRole]);
  
  // Get all permissions for current role
  const rolePermissions = useMemo(() => {
    if (!effectiveRole) return {};
    
    return defaultPermissions.reduce((acc, permission) => {
      acc[permission.id] = !!permission.default[effectiveRole];
      return acc;
    }, {} as Record<string, boolean>);
  }, [effectiveRole]);
  
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
    isAdmin: effectiveRole === 'admin' || effectiveRole === 'propietario' || 
             hasTemporaryRole(user?.id || '', 'admin'),
    isManager: effectiveRole === 'gerente' || isRoleEqualOrInheritsFrom(effectiveRole || '', 'gerente') ||
               hasTemporaryRole(user?.id || '', 'gerente'),
    isCashier: effectiveRole === 'cajero' || isRoleEqualOrInheritsFrom(effectiveRole || '', 'cajero') ||
               hasTemporaryRole(user?.id || '', 'cajero'),
    isKitchen: effectiveRole === 'cocina' || effectiveRole === 'kitchen' || 
              isRoleEqualOrInheritsFrom(effectiveRole || '', 'cocina') ||
              hasTemporaryRole(user?.id || '', 'cocina'),
    isWaiter: effectiveRole === 'mesero' || isRoleEqualOrInheritsFrom(effectiveRole || '', 'mesero') ||
              hasTemporaryRole(user?.id || '', 'mesero'),
    isDelivery: effectiveRole === 'repartidor' || effectiveRole === 'delivery' || 
               isRoleEqualOrInheritsFrom(effectiveRole || '', 'repartidor') ||
               hasTemporaryRole(user?.id || '', 'repartidor'),
    effectiveRole,
    temporaryRole,
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
