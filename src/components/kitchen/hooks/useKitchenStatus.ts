import { useState } from 'react';
import { toast } from 'sonner';
import { updateOrderStatusInKitchen as updateOrderStatus } from '@/services/kitchen/kitchenService';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { KitchenTabStatus } from '../types';

export const useKitchenStatus = (hasManagePermission: boolean, onOrderUpdated: () => void) => {
  const [orderStatus, setOrderStatus] = useState<KitchenTabStatus>('pending');

  // Actualizar el estado de una orden
  const updateOrderStatusHandler = async (orderId: string, newStatus: NormalizedOrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus, hasManagePermission);
    
    // Si la actualización fue exitosa, recargar órdenes
    if (success) {
      // Llamar al callback para actualizar las órdenes
      onOrderUpdated();
    }
  };

  return {
    orderStatus,
    setOrderStatus,
    updateOrderStatusHandler
  };
};
