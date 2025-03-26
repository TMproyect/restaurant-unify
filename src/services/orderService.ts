
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id?: string;
  table_id?: string;
  table_number?: number;
  customer_name: string;
  status: string; // Changed from union type to string to match database response
  total: number;
  items_count: number;
  is_delivery: boolean;
  kitchen_id?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

// Obtener todas las órdenes
export const getOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    toast.error('Error al cargar las órdenes');
    return [];
  }
};

// Obtener una orden específica con sus items
export const getOrderWithItems = async (orderId: string) => {
  try {
    // Obtener la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Obtener los items de la orden
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return { ...order, items };
  } catch (error) {
    console.error('Error obteniendo orden con items:', error);
    toast.error('Error al cargar los detalles de la orden');
    return null;
  }
};

// Crear una nueva orden con sus items
export const createOrder = async (order: Order, items: OrderItem[]) => {
  try {
    // Insertar la orden primero
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: order.table_id,
        table_number: order.table_number,
        customer_name: order.customer_name,
        status: order.status,
        total: order.total,
        items_count: items.length,
        is_delivery: order.is_delivery,
        kitchen_id: order.kitchen_id
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Luego insertar los items de la orden
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      menu_item_id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderData;
  } catch (error) {
    console.error('Error creando orden:', error);
    toast.error('Error al crear la orden');
    return null;
  }
};

// Actualizar el estado de una orden
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    
    toast.success(`Orden actualizada a "${status}"`);
    return data;
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    toast.error('Error al actualizar el estado de la orden');
    return null;
  }
};

// Suscribirse a cambios en órdenes en tiempo real
export const subscribeToOrders = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('orders-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, callback)
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};
