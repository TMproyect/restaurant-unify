
import { useAuth } from '@/contexts/auth/AuthContext';

export const useKitchenPermissions = () => {
  const { user } = useAuth();
  
  // Verificar permisos del usuario
  const hasViewPermission = user?.role === 'admin' || 
                            user?.role === 'propietario' ||
                            user?.role === 'gerente' ||
                            user?.role === 'cocina' || 
                            user?.role === 'kitchen';
  
  const hasManagePermission = user?.role === 'admin' || 
                             user?.role === 'propietario' ||
                             user?.role === 'gerente' ||
                             user?.role === 'cocina' || 
                             user?.role === 'kitchen';
  
  return {
    hasViewPermission,
    hasManagePermission
  };
};
