
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserRole } from '@/contexts/auth/types';

export function useAdmin() {
  const { user } = useAuth();
  
  // Forma segura de comprobar si el usuario es administrador
  // Ensure we have a valid user with a role property
  const isAdmin = !!user && ((user.role === 'admin' as UserRole) || (user.role === 'manager' as UserRole));
  
  console.log("useAdmin hook called, user:", user, "isAdmin:", isAdmin);
  
  return { isAdmin };
}
