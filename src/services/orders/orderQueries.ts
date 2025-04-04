
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
    
    // Use primitive types instead of complex objects to avoid type recursion
    const { data, error } = await supabase
      .from('orders')
      .select('id, table_number, customer_name, status, total, items_count, is_delivery, table_id, kitchen_id, created_at, updated_at, external_id')
      .eq('external_id', externalId)
      .limit(1);
    
    if (error) {
      console.error('Error buscando orden por ID externo:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No se encontró orden con ese ID externo');
      return null;
    }
    
    // Simple mapping with optional properties safely handled
    const order: Order = {
      id: data[0].id,
      table_number: data[0].table_number,
      customer_name: data[0].customer_name,
      status: data[0].status,
      total: data[0].total,
      items_count: data[0].items_count,
      is_delivery: data[0].is_delivery,
      table_id: data[0].table_id,
      kitchen_id: data[0].kitchen_id,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      external_id: data[0].external_id,
      // Set optional properties that might not be in the query
      discount: undefined
    };
    
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
