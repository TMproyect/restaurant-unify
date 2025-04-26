
import { supabase } from '@/integrations/supabase/client';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { toast } from 'sonner';

export const updateOrderStatus = async (orderId: string, status: NormalizedOrderStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
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
