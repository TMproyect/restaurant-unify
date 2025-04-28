
import { usePermissions } from '@/hooks/use-permissions';

export const useKitchenPermissions = () => {
  const { hasPermission } = usePermissions();
  
  // Using the cached permission system for better performance
  const hasViewPermission = hasPermission('kitchen.view');
  const hasManagePermission = hasPermission('kitchen.manage');
  
  return {
    hasViewPermission,
    hasManagePermission
  };
};
