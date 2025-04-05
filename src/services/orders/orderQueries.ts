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

    console.log(`Orders fetched successfully: ${data?.length || 0}`);
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

// Get order by external ID
export const getOrderByExternalId = async (externalId: string): Promise<Order | null> => {
  try {
    console.log(`Buscando orden con ID externo: ${externalId}`);
    
    // First check if the table exists
    const tableCheck = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (tableCheck.error) {
      console.error('Error checking orders table:', tableCheck.error);
      return null;
    }
    
    // Try to query with external_id - using more explicit handling for types
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('external_id', externalId)
      .maybeSingle();
    
    // Handle error - check specifically for missing column
    if (error) {
      if (error.message && error.message.includes("column 'external_id' does not exist")) {
        console.error('The external_id column does not exist in the orders table');
        return null;
      }
      
      console.error('Error buscando orden por ID externo:', error);
      return null;
    }
    
    // No data found
    if (!data) {
      console.log('No se encontró orden con ese ID externo');
      return null;
    }
    
    // Return the data as Order
    return data as Order;
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
