
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, Check } from 'lucide-react';

interface ActionButtonProps {
  orderStatus: 'pending' | 'preparing' | 'ready';
  hasManagePermission: boolean;
  orderId: string;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  orderStatus,
  hasManagePermission,
  orderId,
  updateOrderStatus
}) => {
  if (!hasManagePermission) return null;
  
  if (orderStatus === 'pending') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-7"
        onClick={() => updateOrderStatus(orderId, 'preparing')}
      >
        <ChefHat size={14} className="mr-1" /> Preparar
      </Button>
    );
  } else if (orderStatus === 'preparing') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-7"
        onClick={() => updateOrderStatus(orderId, 'ready')}
      >
        <Check size={14} className="mr-1" /> Completado
      </Button>
    );
  }
  
  return null;
};

export default ActionButton;
