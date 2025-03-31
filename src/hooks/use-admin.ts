
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserRole } from '@/contexts/auth/types';

export function useAdmin() {
  const { user } = useAuth();
  
  // Verificar si el usuario es admin o propietario (roles administrativos)
  const isAdmin = !!user && (
    user.role === 'admin' || 
    user.role === 'propietario'
  );
  
  console.log("useAdmin hook called, user:", user, "isAdmin:", isAdmin, "user role:", user?.role);
  
  return { isAdmin };
}
