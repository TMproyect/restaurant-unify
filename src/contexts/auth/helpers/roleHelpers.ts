
import { UserRole } from '../types';

// Function to validate and adjust role if necessary
export const validateUserRole = (role?: string): UserRole => {
  // Default roles mapping from English to Spanish
  const roleMapping: Record<string, UserRole> = {
    'admin': 'admin',
    'waiter': 'mesero',
    'kitchen': 'cocina',
    'delivery': 'repartidor',
    'manager': 'gerente',
    'owner': 'propietario'
  };

  // First check if it's already a valid Spanish role
  if (role && ['admin', 'gerente', 'mesero', 'cocina', 'repartidor', 'propietario'].includes(role)) {
    return role as UserRole;
  }

  // Then check if it's an English role that needs translation
  if (role && roleMapping[role]) {
    console.log(`Translating role from '${role}' to '${roleMapping[role]}'`);
    return roleMapping[role];
  }

  // Default to admin if invalid/undefined
  console.warn(`Invalid or undefined role: ${role}, defaulting to 'admin'`);
  return 'admin';
};
