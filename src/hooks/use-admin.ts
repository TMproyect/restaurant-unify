
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserRole } from '@/contexts/auth/types';

export function useAdmin() {
  const { user } = useAuth();
  
  // Forma segura de comprobar si el usuario es administrador
  // Ensure we have a valid user with a role property
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
