
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '../orders';
import { prepareInsertData, mapSingleResponse } from '@/utils/supabaseHelpers';
import { createNotification } from '../notificationService';
import { DeliveryOrder, DeliveryAddress } from './types';

// Assign driver to delivery
export const assignDeliveryDriver = async (orderId: string, driverId: string, driverName: string): Promise<boolean> => {
  try {
    console.log(`Assigning driver ${driverName} (${driverId}) to order ${orderId}`);
    
    // Update order with driver information
    const { data, error } = await supabase
      .from('orders')
      .update({
        // In a real app, these would be proper columns in the orders table
        driver_id: driverId,
        driver_name: driverName,
        status: 'en-route',
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error assigning delivery driver:', error);
      return false;
    }

    // Create notification for driver assignment
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId) {
        await createNotification({
          title: "Repartidor asignado",
          description: `Pedido asignado a ${driverName}`,
          type: "order", // You might want to add a delivery type
          user_id: userId,
          link: `/delivery?id=${orderId}`,
          action_text: "Ver detalles"
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification for driver assignment:', notifError);
    }

    return true;
  } catch (error) {
    console.error('Error assigning delivery driver:', error);
    return false;
  }
};

// Mark delivery as delivered
export const markDeliveryCompleted = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`Marking delivery ${orderId} as completed`);
    
    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        actual_delivery: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error marking delivery as completed:', error);
      return false;
    }

    // Create notification for completed delivery
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId) {
        await createNotification({
          title: "Entrega completada",
          description: `El pedido ha sido entregado exitosamente`,
          type: "order",
          user_id: userId,
          link: `/delivery?id=${orderId}`,
          action_text: "Ver detalles"
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification for completed delivery:', notifError);
    }

    return true;
  } catch (error) {
    console.error('Error marking delivery as completed:', error);
    return false;
  }
};

// Create a new delivery order
export const createDeliveryOrder = async (
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, 
  items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[],
  deliveryData: {
    address: DeliveryAddress,
    phone_number: string
  }
): Promise<DeliveryOrder | null> => {
  try {
    console.log('Creating new delivery order:', orderData);
    console.log('Delivery data:', deliveryData);
    
    // Create the order with is_delivery set to true
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...prepareInsertData(orderData),
        is_delivery: true
        // In a real app, we would store delivery address in a separate table
        // and reference it here, or add address fields to the orders table
      } as any)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating delivery order:', orderError);
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
    
    console.log('Delivery order created successfully with ID:', orderResult.id);
    
    // Create the order items
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
        .insert(orderItems as any);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      } else {
        console.log(`${orderItems.length} order items created successfully`);
      }
    }

    // Create notification for new delivery order
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId) {
        await createNotification({
          title: "Nuevo pedido de delivery",
          description: `Cliente: ${orderData.customer_name} - ${items.length} ítems`,
          type: "order",
          user_id: userId,
          link: `/delivery?id=${orderResult.id}`,
          action_text: "Ver pedido"
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification for new delivery:', notifError);
    }

    // Return the delivery order with address info
    return {
      ...orderResult,
      address: deliveryData.address,
      phone_number: deliveryData.phone_number
    };
  } catch (error) {
    console.error('Error creating delivery order:', error);
    return null;
  }
};
