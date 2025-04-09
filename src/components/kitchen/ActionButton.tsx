
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
          variant="success" 
          size="xs"
          className="flex items-center gap-1"
          onClick={() => updateOrderStatus(orderId, 'preparing')}
        >
          <Utensils size={14} />
          <span>Preparar</span>
        </Button>
      );
    
    case 'preparing':
      return (
        <Button 
          variant="success" 
          size="xs"
          className="flex items-center gap-1"
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
