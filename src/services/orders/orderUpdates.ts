
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order.types';
import { toast } from 'sonner';

/**
 * Updates the status of an order
 * @param orderId ID of the order to update
 * @param newStatus New status value
 * @returns boolean indicating success
 */
export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<boolean> => {
  console.log(`🔄 [orderUpdates] Updating order ${orderId} status to ${newStatus}`);
  
  try {
    // Normalizar el estado para asegurar consistencia
    const normalizedStatus = normalizeOrderStatus(newStatus);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: normalizedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('❌ [orderUpdates] Error updating order status:', error);
      throw new Error(error.message);
    }
    
    console.log(`✅ [orderUpdates] Successfully updated order ${orderId} status to ${normalizedStatus}`);
    return true;
  } catch (error) {
    console.error(`❌ [orderUpdates] Exception updating order ${orderId} status:`, error);
    return false;
  }
};

/**
 * Normalizes order status to ensure consistency across the application
 */
const normalizeOrderStatus = (status: string): string => {
  // Convertir todo a minúsculas para facilitar la comparación
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('pend')) {
    return 'pending';
  } else if (normalizedStatus.includes('prepar')) {
    return 'preparing';
  } else if (normalizedStatus.includes('list')) {
    return 'ready';
  } else if (normalizedStatus.includes('entrega')) {
    return 'delivered';
  } else if (normalizedStatus.includes('cancel')) {
    return 'cancelled';
  }
  
  // Si no coincide con ninguno de los anteriores, devolver el original
  return status;
};

/**
 * Updates multiple fields of an order
 * @param orderId ID of the order to update
 * @param updates Object containing the fields to update
 * @returns boolean indicating success
 */
export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
  console.log(`🔄 [orderUpdates] Updating order ${orderId} with:`, updates);
  
  try {
    // Si se está actualizando el estado, normalizarlo
    if (updates.status) {
      updates.status = normalizeOrderStatus(updates.status);
    }
    
    // Asegurar que siempre se actualice el campo updated_at
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('orders')
      .update(updatesWithTimestamp)
      .eq('id', orderId);
    
    if (error) {
      console.error('❌ [orderUpdates] Error updating order:', error);
      throw new Error(error.message);
    }
    
    console.log(`✅ [orderUpdates] Successfully updated order ${orderId}`);
    return true;
  } catch (error) {
    console.error(`❌ [orderUpdates] Exception updating order ${orderId}:`, error);
    return false;
  }
};
