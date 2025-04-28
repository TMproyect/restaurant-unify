
import { UserRole } from '@/contexts/auth/types';
import { systemRoles } from '@/data/permissionsData';

/**
 * Normalize a role name from English to Spanish if needed
 */
export const normalizeRoleName = (role?: string): string => {
  if (!role) return 'admin';
  
  const normalizedRole = role.toLowerCase();
  
  // Role translation mapping
  const roleMapping: Record<string, string> = {
    'kitchen': 'cocina',
    'delivery': 'repartidor',
    'manager': 'gerente',
    'owner': 'propietario',
    'cashier': 'cajero',
    'waiter': 'mesero'
  };
  
  // Check if it needs to be translated
  if (roleMapping[normalizedRole]) {
    return roleMapping[normalizedRole];
  }
  
  return normalizedRole;
};

/**
 * Get a display-friendly name for a role
 */
export const getRoleDisplayName = (role: string): string => {
  const normalizedRole = normalizeRoleName(role);
  
  // Use the system roles display name mapping
  if (systemRoles[normalizedRole]) {
    return systemRoles[normalizedRole];
  }
  
  // If not found, capitalize first letter
  return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
};

/**
 * Format a value as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

/**
 * Create a consistent class name string
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
