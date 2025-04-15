
import { useState } from 'react';
import { toast } from 'sonner';
import { updateOrderStatus } from '@/services/orders/orderUpdates';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { KitchenTabStatus } from '../types';

export const useKitchenStatus = (hasManagePermission: boolean, onOrderUpdated: () => void) => {
  const [orderStatus, setOrderStatus] = useState<KitchenTabStatus>('pending');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Actualizar el estado de una orden
  const updateOrderStatusHandler = async (orderId: string, newStatus: NormalizedOrderStatus) => {
    // Validate inputs
    if (!orderId) {
      console.error('updateOrderStatusHandler: ID de orden inválido');
      toast.error('ID de orden inválido');
      return false;
    }
    
    if (!newStatus) {
      console.error('updateOrderStatusHandler: Estado nuevo inválido');
      toast.error('Estado nuevo inválido');
      return false;
    }
    
    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      // Verificar permisos
      if (!hasManagePermission) {
        setUpdateError('No tienes permisos para actualizar órdenes');
        toast.error('No tienes permisos para realizar esta acción');
        return false;
      }
      
      console.log(`⏳ Actualizando orden ${orderId} a estado: ${newStatus}`);
      
      const success = await updateOrderStatus(orderId, newStatus);
      
      // Si la actualización fue exitosa, recargar órdenes
      if (success) {
        console.log(`✅ Orden ${orderId} actualizada correctamente a ${newStatus}`);
        // Llamar al callback para actualizar las órdenes
        onOrderUpdated();
        return true;
      } else {
        console.error(`❌ Error al actualizar orden ${orderId} a ${newStatus}`);
        setUpdateError('Error al actualizar el estado de la orden');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ updateOrderStatusHandler error:', error);
      setUpdateError(`Error al actualizar: ${errorMessage}`);
      toast.error(`Error: ${errorMessage}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    orderStatus,
    setOrderStatus,
    updateOrderStatusHandler,
    isUpdating,
    updateError
  };
};
