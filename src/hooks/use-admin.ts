
import { useAuth } from '@/contexts/auth/AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  
  // Forma segura de comprobar si el usuario es administrador
  // Ensure we have a valid user with a role property
  const isAdmin = !!user && user.role === 'admin';
  
  return { isAdmin };
}
