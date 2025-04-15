
import { supabase } from '@/integrations/supabase/client';
import { OrderDisplay, OrderItem } from '@/components/kitchen/types';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';

export const loadKitchenOrders = async (
  kitchenId: string,
  statusFilters: string[],
  hasViewPermission: boolean,
  dateFilter?: Date
): Promise<OrderDisplay[]> => {
  try {
    if (!hasViewPermission) {
      console.error('⛔ [KitchenService] Usuario sin permisos');
      return [];
    }
    
    console.log(`🔍 [KitchenService] Cargando órdenes para cocina: ${kitchenId}`);
    console.log(`🔍 [KitchenService] Filtros de estado: ${statusFilters.join(', ')}`);
    
    if (dateFilter) {
      console.log(`🔍 [KitchenService] Filtro de fecha: ${dateFilter.toISOString()}`);
    }
    
    let query = supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        kitchen_id,
        customer_name,
        table_number,
        total,
        order_source,
        updated_at,
        order_items (
          id,
          name,
          quantity,
          notes,
          variants
        )
      `)
      .in('status', statusFilters)
      .order('created_at', { ascending: true });
    
    // Si se proporciona un filtro de fecha, aplicarlo
    if (dateFilter) {
      // Obtener el final del día (mañana a las 00:00:00)
      const tomorrow = new Date(dateFilter);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Filtrar entre la fecha dada (inicio del día) y mañana (inicio del día)
      query = query
        .gte('created_at', dateFilter.toISOString())
        .lt('created_at', tomorrow.toISOString());
    }
    
    // Filtrar por cocina si no es "all"
    if (kitchenId !== 'all') {
      query = query.eq('kitchen_id', kitchenId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ [KitchenService] Error al cargar órdenes:', error);
      throw error;
    }
    
    console.log(`✅ [KitchenService] Órdenes cargadas: ${data.length}`);
    
    // Transformar los datos al formato esperado por el componente
    const orders: OrderDisplay[] = data.map(order => {
      // Convertir order_items a OrderItem[]
      const items: OrderItem[] = (order.order_items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes || '',
        variants: item.variants || [],
      }));
      
      return {
        id: order.id,
        table: order.table_number?.toString() || 'Delivery',
        customerName: order.customer_name || 'Cliente',
        time: order.created_at,
        createdAt: order.created_at,
        kitchenId: order.kitchen_id || 'main',
        status: normalizeOrderStatus(order.status),
        items,
        orderSource: order.order_source || null,
      };
    });
    
    return orders;
  } catch (error) {
    console.error('❌ [KitchenService] Error en loadKitchenOrders:', error);
    throw error;
  }
};
