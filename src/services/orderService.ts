
import { supabase } from '@/integrations/supabase/client';
import { mapArrayResponse, mapSingleResponse, prepareInsertData, processQueryResult, processSingleResult, filterValue } from '@/utils/supabaseHelpers';

export interface Order {
  id?: string;
  table_number: number;
  customer_name: string;
  status: string;
  total: number;
  items_count: number;
  is_delivery: boolean;
  table_id?: string;
  kitchen_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  created_at?: string;
}

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return mapArrayResponse<Order>(data, 'Failed to map orders data');
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Get specific order with items
export const getOrderWithItems = async (orderId: string): Promise<{ order: Order | null, items: OrderItem[] }> => {
  try {
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

    return {
      order: mapSingleResponse<Order>(orderData, 'Failed to map order data'),
      items: mapArrayResponse<OrderItem>(itemsData, 'Failed to map order items')
    };
  } catch (error) {
    console.error('Error getting order with items:', error);
    return { order: null, items: [] };
  }
};

// Create a new order with items
export const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<Order | null> => {
  try {
    // First, create the order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(prepareInsertData(orderData) as any)
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
        .insert(orderItems as any);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // We don't return null here because the order was created successfully
      }
    }

    return orderResult;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: now
      } as any)
      .eq('id', filterValue(orderId));

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Subscribe to order changes
export const subscribeToOrders = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('orders-channel')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        payload => {
          callback(payload);
        })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
