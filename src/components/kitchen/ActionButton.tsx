
import React from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, CheckCircle } from 'lucide-react';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface ActionButtonProps {
  orderStatus: NormalizedOrderStatus;
  hasManagePermission: boolean;
  orderId: string;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  orderStatus,
  hasManagePermission,
  orderId,
  updateOrderStatus
}) => {
  // Only show button if user has permission
  if (!hasManagePermission) {
    return null;
  }

  // Determine which action button to show based on current status
  switch (orderStatus) {
    case 'pending':
      return (
        <Button 
          variant="outline" 
          size="xs"
          className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:text-amber-900"
          onClick={() => updateOrderStatus(orderId, 'preparing')}
        >
          <Utensils size={14} />
          <span>Preparar</span>
        </Button>
      );
    
    case 'preparing':
      return (
        <Button 
          variant="outline" 
          size="xs"
          className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:text-green-900"
          onClick={() => updateOrderStatus(orderId, 'ready')}
        >
          <CheckCircle size={14} />
          <span>¡Listo!</span>
        </Button>
      );
    
    default:
      return null;
  }
};

export default ActionButton;
