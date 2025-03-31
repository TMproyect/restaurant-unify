
// Utility function for formatting currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
}

// Utility function for mapping English role names to Spanish
export function mapRoleToSpanish(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'manager': 'gerente',
    'waiter': 'mesero',
    'kitchen': 'cocina',
    'delivery': 'repartidor',
    'owner': 'propietario'
  };
  
  return roleMap[role.toLowerCase()] || role;
}

// Utility function for mapping Spanish role names to English
export function mapRoleToEnglish(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'gerente': 'manager',
    'mesero': 'waiter',
    'cocina': 'kitchen',
    'repartidor': 'delivery',
    'propietario': 'owner'
  };
  
  return roleMap[role.toLowerCase()] || role;
}
