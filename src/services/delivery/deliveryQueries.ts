
import { supabase } from '@/integrations/supabase/client';
import { DeliveryOrder } from './types';

// Get all delivery orders
export const getDeliveryOrders = async (): Promise<DeliveryOrder[]> => {
  try {
    console.log('Fetching delivery orders...');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('is_delivery', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery orders:', error);
      return [];
    }

    // This is a simplified version. In a real app, the delivery address
    // and other delivery-specific fields would be in a separate table
    const deliveryOrders = data?.map(order => {
      return {
        ...order,
        address: {
          street: 'Dirección de entrega', // This would come from a separate table
          city: 'Ciudad',
          state: 'Estado',
          zip: '00000',
          instructions: 'Instrucciones de entrega'
        },
        phone_number: '+1234567890' // This would come from a separate table
      } as DeliveryOrder;
    }) || [];

    console.log(`Found ${deliveryOrders.length} delivery orders`);
    return deliveryOrders;
  } catch (error) {
    console.error('Error getting delivery orders:', error);
    return [];
  }
};
