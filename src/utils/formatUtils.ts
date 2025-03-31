
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
