
/**
 * Utility for managing and caching temporary role assignments
 */

import { UserRole } from "@/contexts/auth/types";
import { isRoleEqualOrInheritsFrom } from "@/utils/permissionsCache";

// Cache structure: userId -> { temporaryRole, expiresAt }
const temporaryRolesCache: Record<string, { role: UserRole, expiresAt: Date }> = {};

/**
 * Assign a temporary role to a user
 */
export const assignTemporaryRole = (
  userId: string,
  role: UserRole,
  durationMinutes: number = 60
): void => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
  
  temporaryRolesCache[userId] = { role, expiresAt };
  console.log(`Temporary role ${role} assigned to user ${userId}, expires at ${expiresAt}`);
};

/**
 * Get current temporary role for a user if valid
 */
export const getTemporaryRole = (userId: string): UserRole | null => {
  const assignment = temporaryRolesCache[userId];
  
  // No assignment exists
  if (!assignment) {
    return null;
  }
  
  // Check if the assignment has expired
  if (new Date() > assignment.expiresAt) {
    // Clean up expired assignment
    removeTemporaryRole(userId);
    return null;
  }
  
  return assignment.role;
};

/**
 * Remove temporary role assignment for a user
 */
export const removeTemporaryRole = (userId: string): void => {
  if (temporaryRolesCache[userId]) {
    delete temporaryRolesCache[userId];
    console.log(`Temporary role removed for user ${userId}`);
  }
};

/**
 * Check if a user has a specific temporary role or one that inherits from it
 */
export const hasTemporaryRole = (userId: string, requiredRole: UserRole): boolean => {
  const temporaryRole = getTemporaryRole(userId);
  
  if (!temporaryRole) {
    return false;
  }
  
  return isRoleEqualOrInheritsFrom(temporaryRole, requiredRole);
};

/**
 * Get all active temporary role assignments
 */
export const getAllTemporaryRoles = (): Record<string, { role: UserRole, expiresAt: Date }> => {
  // Clean up expired assignments first
  cleanupExpiredAssignments();
  
  return { ...temporaryRolesCache };
};

/**
 * Remove all expired temporary role assignments
 */
export const cleanupExpiredAssignments = (): void => {
  const now = new Date();
  
  Object.keys(temporaryRolesCache).forEach(userId => {
    const assignment = temporaryRolesCache[userId];
    if (now > assignment.expiresAt) {
      delete temporaryRolesCache[userId];
      console.log(`Expired temporary role removed for user ${userId}`);
    }
  });
};

// Run cleanup every minute
setInterval(cleanupExpiredAssignments, 60000);
