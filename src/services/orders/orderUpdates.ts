
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order.types';
import { toast } from 'sonner';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';

/**
 * Updates the status of an order
 * @param orderId ID of the order to update
 * @param newStatus New status value
 * @param cancellationReason Optional reason for cancellation
 * @returns boolean indicating success
 */
export const updateOrderStatus = async (
  orderId: string, 
  newStatus: string,
  cancellationReason?: string
): Promise<boolean> => {
  console.log(`🔄 [orderUpdates] Updating order ${orderId} status to ${newStatus}`);
  
  try {
    // Normalizar el estado para asegurar consistencia
    const normalizedStatus = normalizeOrderStatus(newStatus);
    
    const updateData: Partial<Order> = { 
      status: normalizedStatus,
      updated_at: new Date().toISOString()
    };
    
    // If there's a cancellation reason and the status is 'cancelled', store it
    if (normalizedStatus === 'cancelled' && cancellationReason) {
      // In a real application, store the cancellation reason in a cancellation_reasons table
      // For now, we'll use the console to demonstrate
      console.log(`🔄 [orderUpdates] Cancellation reason for order ${orderId}: ${cancellationReason}`);
      
      // You might want to store this in a separate table or as metadata in the order
      // updateData.cancellation_reason = cancellationReason;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
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
