
/**
 * Utility for caching and efficiently checking permissions
 */

import { UserRole } from "@/contexts/auth/types";

// Cache structure: userId -> { permissionId -> boolean }
const permissionsCache: Record<string, Record<string, boolean>> = {};

// Cache structure: roleHierarchy -> { role -> parent role }
const roleHierarchy: Record<string, UserRole | null> = {
  'admin': null, // Admin is the top role
  'propietario': 'admin',
  'gerente': 'propietario',
  'mesero': 'gerente',
  'cocina': 'gerente',
  'kitchen': 'cocina', // English equivalent mapped to Spanish role
  'repartidor': 'gerente',
  'delivery': 'repartidor', // English equivalent mapped to Spanish role
  'cajero': 'gerente'
};

// Maps English role names to Spanish equivalents for consistency
const roleEquivalents: Record<string, UserRole> = {
  'kitchen': 'cocina',
  'delivery': 'repartidor'
};

/**
 * Get the normalized role name (converting English to Spanish when needed)
 */
export const getNormalizedRole = (role: string): UserRole => {
  return (roleEquivalents[role] as UserRole) || (role as UserRole);
};

/**
 * Check if childRole is equal to or inherits from parentRole
 */
export const isRoleEqualOrInheritsFrom = (childRole: string, parentRole: string): boolean => {
  if (!childRole || !parentRole) return false;
  
  const normalizedChildRole = getNormalizedRole(childRole);
  const normalizedParentRole = getNormalizedRole(parentRole);
  
  // Direct match
  if (normalizedChildRole === normalizedParentRole) return true;
  
  // Check inheritance chain
  let currentRole: UserRole | null = normalizedChildRole;
  while (currentRole && roleHierarchy[currentRole]) {
    currentRole = roleHierarchy[currentRole];
    if (currentRole === normalizedParentRole) return true;
  }
  
  return false;
};

/**
 * Cache permissions for a user
 */
export const cacheUserPermissions = (
  userId: string, 
  permissions: Record<string, boolean>
): void => {
  permissionsCache[userId] = { ...permissions };
  console.log(`Cached ${Object.keys(permissions).length} permissions for user ${userId}`);
};

/**
 * Get cached permission for a user
 */
export const getCachedPermission = (
  userId: string, 
  permissionId: string
): boolean | undefined => {
  return permissionsCache[userId]?.[permissionId];
};

/**
 * Check if user has permission, first from cache then from provided permissions object
 */
export const hasPermission = (
  userId: string,
  userRole: UserRole,
  permissionId: string,
  permissionsObject?: Record<string, boolean>
): boolean => {
  // First check cache
  const cachedValue = getCachedPermission(userId, permissionId);
  if (cachedValue !== undefined) {
    return cachedValue;
  }
  
  // If not in cache but permissions object provided, check there
  if (permissionsObject && permissionId in permissionsObject) {
    return !!permissionsObject[permissionId];
  }
  
  // If critical admin permission for admin/owner, always return true
  const isCriticalAdminPermission = permissionId === 'settings.roles' || permissionId === 'settings.access';
  if (isCriticalAdminPermission && (userRole === 'admin' || userRole === 'propietario')) {
    return true;
  }
  
  return false;
};

/**
 * Clear user's permissions cache
 */
export const clearUserPermissionsCache = (userId: string): void => {
  if (permissionsCache[userId]) {
    delete permissionsCache[userId];
    console.log(`Cleared permissions cache for user ${userId}`);
  }
};

/**
 * Clear entire permissions cache
 */
export const clearAllPermissionsCache = (): void => {
  Object.keys(permissionsCache).forEach(key => {
    delete permissionsCache[key];
  });
  console.log('Cleared all permissions cache');
};
