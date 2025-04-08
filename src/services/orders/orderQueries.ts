
import { supabase } from '@/integrations/supabase/client';
import { mapArrayResponse, mapSingleResponse, filterValue } from '@/utils/supabaseHelpers';
import { Order, OrderItem } from '@/types/order.types';

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    console.log('🔍 [getOrders] Starting to fetch all orders...');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [getOrders] Error fetching orders:', error);
      console.error('❌ [getOrders] Error details:', JSON.stringify(error, null, 2));
      return [];
    }

    console.log(`✅ [getOrders] Orders fetched successfully: ${data?.length || 0}`);
    console.log(`📊 [getOrders] First few orders:`, data?.slice(0, 2));
    
    try {
      const mappedData = mapArrayResponse<Order>(data, 'Failed to map orders data');
      console.log(`✅ [getOrders] Orders mapped successfully: ${mappedData.length}`);
      return mappedData;
    } catch (mappingError) {
      console.error('❌ [getOrders] Error mapping orders data:', mappingError);
      console.error('❌ [getOrders] Raw data that failed mapping:', JSON.stringify(data, null, 2));
      return [];
    }
  } catch (error) {
    console.error('❌ [getOrders] Unexpected error getting orders:', error);
    return [];
  }
};

// Get specific order with items
export const getOrderWithItems = async (orderId: string): Promise<{ order: Order | null, items: OrderItem[] }> => {
  try {
    console.log(`🔍 [getOrderWithItems] Fetching order details for ID: ${orderId}`);
    // Get order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', filterValue(orderId))
      .single();

    if (orderError) {
      console.error('❌ [getOrderWithItems] Error fetching order:', orderError);
      console.error('❌ [getOrderWithItems] Error details:', JSON.stringify(orderError, null, 2));
      return { order: null, items: [] };
    }

    console.log(`✅ [getOrderWithItems] Order fetched successfully:`, orderData);

    // Get order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', filterValue(orderId));

    if (itemsError) {
      console.error('❌ [getOrderWithItems] Error fetching order items:', itemsError);
      console.error('❌ [getOrderWithItems] Error details:', JSON.stringify(itemsError, null, 2));
      return { 
        order: mapSingleResponse<Order>(orderData, 'Failed to map order data'), 
        items: [] 
      };
    }

    console.log(`✅ [getOrderWithItems] Order items fetched for ID ${orderId}:`, itemsData?.length || 0);
    
    try {
      const mappedOrder = mapSingleResponse<Order>(orderData, 'Failed to map order data');
      const mappedItems = mapArrayResponse<OrderItem>(itemsData, 'Failed to map order items');
      
      console.log(`✅ [getOrderWithItems] Order and items mapped successfully`);
      
      return {
        order: mappedOrder,
        items: mappedItems
      };
    } catch (mappingError) {
      console.error('❌ [getOrderWithItems] Error mapping order or items data:', mappingError);
      return { order: null, items: [] };
    }
  } catch (error) {
    console.error('❌ [getOrderWithItems] Unexpected error getting order with items:', error);
    return { order: null, items: [] };
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

// Get all kitchens
export const getKitchens = async (): Promise<{ id: string, name: string }[]> => {
  console.log('🔍 [getKitchens] Fetching kitchen options');
  // In a real app, this would fetch from the database
  // For now, we'll return hardcoded values
  const kitchens = [
    { id: 'main', name: 'Cocina Principal' },
    { id: 'bar', name: 'Bar' },
    { id: 'grill', name: 'Parrilla' }
  ];
  console.log('✅ [getKitchens] Kitchen options:', kitchens);
  return kitchens;
};
