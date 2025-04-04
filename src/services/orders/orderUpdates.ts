
import { supabase } from '@/integrations/supabase/client';
import { filterValue } from '@/utils/supabaseHelpers';
import { createNotification } from '../notificationService';

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    console.log(`Updating order ${orderId} status to: ${status}`);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: now
      })
      .eq('id', filterValue(orderId));

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    console.log('Order status updated successfully');
    
    // Create notification for status update
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId && orderData) {
        const statusMessages = {
          preparing: "El pedido ha comenzado a prepararse",
          ready: "El pedido está listo para servir",
          delivered: "El pedido ha sido entregado",
          cancelled: "El pedido ha sido cancelado",
          paid: "El pedido ha sido pagado"
        };
        
        const message = statusMessages[status as keyof typeof statusMessages] || `El estado del pedido cambió a ${status}`;
        
        await createNotification({
          title: "Actualización de pedido",
          description: `Mesa ${orderData.table_number}: ${message}`,
          type: "order",
          user_id: userId,
          link: `/orders?id=${orderId}`,
          action_text: "Ver detalles"
        });
        console.log('Order status notification created');
      }
    } catch (notifError) {
      console.error('Failed to create notification for status update:', notifError);
    }

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Process payment for an order
export const processOrderPayment = async (
  orderId: string, 
  paymentDetails: { 
    method: string, 
    amount: number,
    tip?: number,
    discount?: number,
    status?: string 
  }
): Promise<boolean> => {
  try {
    console.log(`Processing payment for order ${orderId}:`, paymentDetails);
    const now = new Date().toISOString();
    
    // In a real-world application, you would:
    // 1. Create a payment record in a payments table
    // 2. Update the order status to 'paid'
    // 3. Integrate with payment processor if needed
    
    // For now, we'll just update the order status
    const status = paymentDetails.status || 'paid';
    
    // Define update object explicitly with correct types
    const updateData: {
      status: string,
      updated_at: string,
      discount?: number
    } = { 
      status,
      updated_at: now
    };
    
    // Add discount if provided
    if (paymentDetails.discount !== undefined) {
      updateData.discount = paymentDetails.discount;
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', filterValue(orderId));

    if (error) {
      console.error('Error processing order payment:', error);
      return false;
    }

    console.log('Order payment processed successfully');
    
    // Create notification for payment
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId && orderData) {
        await createNotification({
          title: "Pago recibido",
          description: `Mesa ${orderData.table_number}: Pago de $${paymentDetails.amount.toFixed(2)} procesado`,
          type: "payment",
          user_id: userId,
          link: `/orders?id=${orderId}`,
          action_text: "Ver detalles"
        });
        console.log('Payment notification created');
      }
    } catch (notifError) {
      console.error('Failed to create notification for payment:', notifError);
    }

    return true;
  } catch (error) {
    console.error('Error processing order payment:', error);
    return false;
  }
};
