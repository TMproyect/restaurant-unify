
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, CheckCircle, XCircle } from 'lucide-react';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface ActionButtonProps {
  orderStatus: NormalizedOrderStatus;
  hasManagePermission: boolean;
  orderId: string;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<boolean>;
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

  // Handler to prevent event propagation when clicking action buttons
  const handleClick = (e: React.MouseEvent, newStatus: NormalizedOrderStatus) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    updateOrderStatus(orderId, newStatus);
  };

  // Determine which action button to show based on current status
  switch (orderStatus) {
    case 'pending':
      return (
        <Button 
          variant="warning" 
          size="sm"
          className="flex items-center gap-1 shadow-sm hover:shadow-md transition-all font-medium w-full"
          onClick={(e) => handleClick(e, 'preparing')}
        >
          <ChefHat size={18} />
          <span>Preparar</span>
        </Button>
      );
    
    case 'preparing':
      return (
        <Button 
          variant="success" 
          size="sm"
          className="flex items-center gap-1 shadow-sm hover:shadow-md transition-all font-medium w-full"
          onClick={(e) => handleClick(e, 'ready')}
        >
          <CheckCircle size={18} />
          <span>¡Listo!</span>
        </Button>
      );
    
    case 'cancelled':
      return (
        <Button 
          variant="outline" 
          size="sm"
          disabled
          className="flex items-center gap-1 w-full opacity-70"
        >
          <XCircle size={18} />
          <span>Cancelado</span>
        </Button>
      );
    
    default:
      return null;
  }
};

export default ActionButton;
