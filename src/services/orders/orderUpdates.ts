
import { supabase } from '@/integrations/supabase/client';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { toast } from 'sonner';

export const updateOrderStatus = async (
  orderId: string, 
  status: NormalizedOrderStatus,
  cancellationReason?: string
): Promise<boolean> => {
  try {
    const updateData: { status: NormalizedOrderStatus, cancellation_reason?: string } = { status };
    
    // If there's a cancellation reason and the status is 'cancelled', store it
    if (status === 'cancelled' && cancellationReason) {
      console.log(`Cancellation reason for order ${orderId}: ${cancellationReason}`);
      // Uncomment if you have a cancellation_reason field in your orders table
      // updateData.cancellation_reason = cancellationReason;
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;

    toast.success(`Orden actualizada: ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error('Error al actualizar el estado de la orden');
    return false;
  }
};
