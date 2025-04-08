
import { supabase } from '@/integrations/supabase/client';
import { mapSingleResponse } from '@/utils/supabaseHelpers';
import { createNotification } from '../notificationService';
import { Order, OrderItem } from '@/types/order.types';

// Create a new order with items
export const createOrder = async (
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'external_id'>, 
  items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]
): Promise<Order | null> => {
  try {
    console.log('Creating new order:', orderData);
    console.log('Order items:', items);
    
    // First, create the order - Use explicit typing instead of prepareInsertData
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return null;
    }

    if (!newOrder) {
      console.error('No data returned from order creation');
      return null;
    }
    
    const orderResult = mapSingleResponse<Order>(newOrder, 'Failed to map new order data');
    if (!orderResult || !orderResult.id) {
      console.error('Error mapping order data or missing order ID');
      return null;
    }
    
    console.log('Order created successfully with ID:', orderResult.id);
    
    // Then, create the order items
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: orderResult.id,
        menu_item_id: item.menu_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // We don't return null here because the order was created successfully
      } else {
        console.log(`${orderItems.length} order items created successfully`);
      }
    }

    // Create notification for new order
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId) {
        await createNotification({
          title: "Nuevo pedido",
          description: `Mesa ${orderData.table_number}: ${orderData.customer_name} - ${items.length} ítems`,
          type: "order",
          user_id: userId,
          link: `/orders?id=${orderResult.id}`,
          action_text: "Ver pedido"
        });
        console.log('Order notification created');
      }
    } catch (notifError) {
      console.error('Failed to create notification for new order:', notifError);
    }

    return orderResult;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Get order by external ID
export const getOrderByExternalId = async (externalId: string): Promise<Order | null> => {
  try {
    console.log(`Buscando orden con ID externo: ${externalId}`);
    
    // Get the order by external_id
    const { data, error } = await supabase
      .rpc('get_order_by_external_id', { 
        p_external_id: externalId 
      });
    
    if (error) {
      console.error('Error obteniendo orden por ID externo (RPC):', error);
      // Fallback: try direct query
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('orders')
        .select('*')
        .eq('external_id', externalId)
        .maybeSingle();
      
      if (fallbackError) {
        console.error('Error en fallback para obtener orden por ID externo:', fallbackError);
        return null;
      }
      
      return fallbackData as Order;
    }
    
    if (!data || data.length === 0) {
      console.log('No se encontró orden con ID externo:', externalId);
      return null;
    }
    
    console.log('Orden encontrada por ID externo:', data[0]);
    return data[0] as Order;
  } catch (error) {
    console.error('Error inesperado al obtener orden por ID externo:', error);
    return null;
  }
};
