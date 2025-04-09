
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, Check, Clock, Ban } from 'lucide-react';
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
  if (!hasManagePermission) return null;
  
  if (orderStatus === 'pending') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-700 hover:text-yellow-800"
        onClick={() => updateOrderStatus(orderId, 'preparing')}
      >
        <ChefHat size={16} className="mr-1" /> Preparar
      </Button>
    );
  } else if (orderStatus === 'preparing') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800"
        onClick={() => updateOrderStatus(orderId, 'ready')}
      >
        <Check size={16} className="mr-1" /> Completar
      </Button>
    );
  } else if (orderStatus === 'ready') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-800"
        onClick={() => updateOrderStatus(orderId, 'delivered')}
      >
        <Clock size={16} className="mr-1" /> Entregar
      </Button>
    );
  }
  
  // Add a separate button for cancellation option that appears for pending and preparing states
  if (orderStatus === 'pending' || orderStatus === 'preparing') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-800 ml-2"
        onClick={() => updateOrderStatus(orderId, 'cancelled')}
      >
        <Ban size={16} className="mr-1" /> Cancelar
      </Button>
    );
  }
  
  return null;
};

export default ActionButton;
