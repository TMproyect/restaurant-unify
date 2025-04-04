
import { supabase } from '@/integrations/supabase/client';
import { mapArrayResponse, mapSingleResponse, filterValue } from '@/utils/supabaseHelpers';
import { Order, OrderItem } from '@/types/order.types';

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching all orders...');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    console.log('Orders fetched successfully:', data?.length || 0);
    return mapArrayResponse<Order>(data, 'Failed to map orders data');
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Get specific order with items
export const getOrderWithItems = async (orderId: string): Promise<{ order: Order | null, items: OrderItem[] }> => {
  try {
    console.log(`Fetching order details for ID: ${orderId}`);
    // Get order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', filterValue(orderId))
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return { order: null, items: [] };
    }

    // Get order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', filterValue(orderId));

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return { 
        order: mapSingleResponse<Order>(orderData, 'Failed to map order data'), 
        items: [] 
      };
    }

    console.log(`Order items fetched for ID ${orderId}:`, itemsData?.length || 0);
    return {
      order: mapSingleResponse<Order>(orderData, 'Failed to map order data'),
      items: mapArrayResponse<OrderItem>(itemsData, 'Failed to map order items')
    };
  } catch (error) {
    console.error('Error getting order with items:', error);
    return { order: null, items: [] };
  }
};

// Get order by external ID - Fixed to avoid deep type instantiation
export const getOrderByExternalId = async (externalId: string): Promise<Order | null> => {
  try {
    console.log(`Buscando orden con ID externo: ${externalId}`);
    
    // Using explicit query without external_id filter since it might not exist yet
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    
    if (error) {
      console.error('Error buscando orden por ID externo:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No orders found');
      return null;
    }

    // Use a type guard to check and compare the external_id safely
    const matchingOrder = data.find(order => {
      return typeof order === 'object' && 
             order !== null && 
             'external_id' in order && 
             order.external_id === externalId;
    });
    
    if (!matchingOrder) {
      console.log('No se encontró orden con ese ID externo');
      return null;
    }
    
    // Create an Order object with all required properties from the base fields
    // and add the optional properties conditionally
    const order: Order = {
      id: matchingOrder.id,
      table_number: matchingOrder.table_number,
      customer_name: matchingOrder.customer_name,
      status: matchingOrder.status,
      total: matchingOrder.total,
      items_count: matchingOrder.items_count,
      is_delivery: matchingOrder.is_delivery,
      table_id: matchingOrder.table_id,
      kitchen_id: matchingOrder.kitchen_id,
      created_at: matchingOrder.created_at,
      updated_at: matchingOrder.updated_at,
    };
    
    // Add optional properties if they exist in the database record with proper type casting
    if ('external_id' in matchingOrder && matchingOrder.external_id !== null) {
      order.external_id = matchingOrder.external_id as string;
    }
    
    if ('discount' in matchingOrder && matchingOrder.discount !== null) {
      order.discount = matchingOrder.discount as number;
    }
    
    return order;
  } catch (error) {
    console.error('Error al obtener orden por ID externo:', error);
    return null;
  }
};

// Get all kitchens
export const getKitchens = async (): Promise<{ id: string, name: string }[]> => {
  console.log('Fetching kitchen options');
  // In a real app, this would fetch from the database
  // For now, we'll return hardcoded values
  return [
    { id: 'main', name: 'Cocina Principal' },
    { id: 'bar', name: 'Bar' },
    { id: 'grill', name: 'Parrilla' }
  ];
};
