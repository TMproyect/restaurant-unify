
import { useAuth } from '@/contexts/auth/AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  
  // Forma segura de comprobar si el usuario es administrador
  const isAdmin = user?.role === 'admin';
  
  return { isAdmin };
}
