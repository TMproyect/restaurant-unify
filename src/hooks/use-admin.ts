
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserRole } from '@/contexts/auth/types';
import { mapRoleToEnglish } from '@/utils/formatUtils';

export function useAdmin() {
  const { user } = useAuth();
  
  // Safely check if the user is an admin, checking both English and Spanish role names
  const isAdmin = !!user && (
    user.role === 'admin' || 
    user.role === 'propietario' || 
    user.role === 'owner' ||
    user.role === 'gerente' ||
    user.role === 'manager'
  );
  
  console.log("useAdmin hook called, user:", user, "isAdmin:", isAdmin);
  
  return { isAdmin };
}
