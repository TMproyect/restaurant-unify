
// Utility function for formatting currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
}

// Función para obtener nombre legible del rol
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'gerente': 'Gerente',
    'mesero': 'Mesero',
    'cocina': 'Cocina',
    'repartidor': 'Repartidor',
    'propietario': 'Propietario'
  };
  
  return roleMap[role.toLowerCase()] || role;
}

// Utility function to translate English role names to Spanish (for legacy code compatibility)
export function translateRoleToSpanish(englishRole: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'manager': 'gerente',
    'waiter': 'mesero',
    'kitchen': 'cocina',
    'delivery': 'repartidor',
    'owner': 'propietario'
  };
  
  return roleMap[englishRole.toLowerCase()] || englishRole;
}

// Utility function to translate Spanish role names to English (for legacy API compatibility)
export function translateRoleToEnglish(spanishRole: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'gerente': 'manager',
    'mesero': 'waiter',
    'cocina': 'kitchen',
    'repartidor': 'delivery',
    'propietario': 'owner'
  };
  
  return roleMap[spanishRole.toLowerCase()] || spanishRole;
}
