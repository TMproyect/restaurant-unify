
import { usePermissions } from '@/hooks/use-permissions';

export const useKitchenPermissions = () => {
  const { hasPermission, temporaryRole, effectiveRole } = usePermissions();
  
  // Using the cached permission system for better performance
  // This now automatically handles temporary roles via the usePermissions hook
  const hasViewPermission = hasPermission('kitchen.view');
  const hasManagePermission = hasPermission('kitchen.manage');
  
  // Check specifically if user has kitchen role either permanently or temporarily
  const isKitchenStaff = effectiveRole === 'cocina' || effectiveRole === 'kitchen';
  
  return {
    hasViewPermission,
    hasManagePermission,
    isKitchenStaff,
    effectiveRole,
    temporaryRole
  };
};
