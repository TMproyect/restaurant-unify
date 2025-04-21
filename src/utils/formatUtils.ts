export const normalizeRoleName = (role: string | null | undefined): string => {
  if (!role) return 'admin';
  
  const roleMap: Record<string, string> = {
    // English to Spanish mappings
    'waiter': 'mesero',
    'kitchen': 'cocina',
    'delivery': 'repartidor',
    'manager': 'gerente',
    'owner': 'propietario',
    'cashier': 'cajero',
    
    // Ensure Spanish roles are preserved
    'admin': 'admin',
    'gerente': 'gerente',
    'mesero': 'mesero',
    'cocina': 'cocina',
    'repartidor': 'repartidor',
    'propietario': 'propietario',
    'cajero': 'cajero'
  };
  
  return roleMap[role.toLowerCase()] || 'admin';
};

// Add or update the getRoleDisplayName function to display the cajero role properly
export const getRoleDisplayName = (role: string | null | undefined): string => {
  if (!role) return 'Administrador';
  
  const displayNames: Record<string, string> = {
    'admin': 'Administrador',
    'gerente': 'Gerente',
    'mesero': 'Mesero',
    'cocina': 'Cocina',
    'kitchen': 'Cocina',
    'repartidor': 'Repartidor',
    'delivery': 'Repartidor',
    'propietario': 'Propietario',
    'cajero': 'Cajero',
    'cashier': 'Cajero'
  };
  
  return displayNames[role.toLowerCase()] || 'Usuario';
};
