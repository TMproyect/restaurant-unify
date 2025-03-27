
import { useAuth } from '@/contexts/auth/AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  
  return { isAdmin };
}
