
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order.types';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

export const getOrders = async (): Promise<Order[]> => {
  console.log('🔍 [orderQueries] Fetching all orders');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [orderQueries] Error fetching orders:', error);
      throw new Error(error.message);
    }
    
    return mapArrayResponse<Order>(data || [], 'Failed to map orders from database');
  } catch (error) {
    console.error('❌ [orderQueries] Exception fetching orders:', error);
    throw error;
  }
};

export const getOrderWithItems = async (orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> => {
  console.log(`🔍 [orderQueries] Fetching order ${orderId} with items`);
  
  try {
    // Fetch the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      if (orderError.code === 'PGRST116') {
        console.log(`ℹ️ [orderQueries] Order ${orderId} not found`);
        return { order: null, items: [] };
      }
      console.error('❌ [orderQueries] Error fetching order:', orderError);
      throw new Error(orderError.message);
    }
    
    // Fetch the order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error('❌ [orderQueries] Error fetching order items:', itemsError);
      throw new Error(itemsError.message);
    }
    
    const order = mapSingleResponse<Order>(orderData, 'Failed to map order from database');
    const items = mapArrayResponse<OrderItem>(itemsData || [], 'Failed to map order items from database');
    
    console.log(`✅ [orderQueries] Order ${orderId} fetched with ${items.length} items`);
    return { order, items };
  } catch (error) {
    console.error(`❌ [orderQueries] Exception fetching order ${orderId}:`, error);
    throw error;
  }
};

export const getOrderByExternalId = async (externalId: string): Promise<Order | null> => {
  console.log(`🔍 [orderQueries] Fetching order by external_id: ${externalId}`);
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('external_id', externalId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ [orderQueries] Error fetching order by external_id:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      console.log(`ℹ️ [orderQueries] No order found with external_id ${externalId}`);
      return null;
    }
    
    return mapSingleResponse<Order>(data, 'Failed to map order from database');
  } catch (error) {
    console.error('❌ [orderQueries] Exception fetching order by external_id:', error);
    throw error;
  }
};

export const getOrdersByTableId = async (tableId: string): Promise<Order[]> => {
  console.log(`🔍 [orderQueries] Fetching orders for table: ${tableId}`);
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('table_id', filterValue(tableId))
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [orderQueries] Error fetching orders by table_id:', error);
      throw new Error(error.message);
    }
    
    console.log(`✅ [orderQueries] Found ${data?.length || 0} orders for table ${tableId}`);
    return mapArrayResponse<Order>(data || [], 'Failed to map orders from database');
  } catch (error) {
    console.error(`❌ [orderQueries] Exception fetching orders for table ${tableId}:`, error);
    throw error;
  }
};

// Add the missing getKitchens function
export const getKitchens = async (): Promise<{id: string, name: string}[]> => {
  console.log('🔍 [orderQueries] Fetching kitchens');
  
  try {
    // For now, we'll return a default set of kitchens
    // In a real system, this would fetch from a kitchens table
    return [
      { id: 'main', name: 'Cocina Principal' },
      { id: 'bar', name: 'Bar' },
      { id: 'grill', name: 'Parrilla' }
    ];
  } catch (error) {
    console.error('❌ [orderQueries] Exception fetching kitchens:', error);
    throw error;
  }
};
