
import { supabase } from '@/integrations/supabase/client';
import { KitchenOption } from '@/components/kitchen/kitchenTypes';
import { OrderDisplay } from '@/components/kitchen/kitchenTypes';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';
import { toast } from 'sonner';

export const loadKitchenOrders = async (
  selectedKitchen: string,
  statusFilter: string[],
  hasPermission: boolean
): Promise<OrderDisplay[]> => {
  if (!hasPermission) {
    console.error('Usuario sin permisos para cargar órdenes de cocina');
    return [];
  }

  try {
    console.log(`Cargando órdenes para cocina: ${selectedKitchen}`);
    
    let query = supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        table_number,
        status,
        kitchen_id,
        created_at,
        updated_at,
        order_source,
        order_items(id, name, notes, quantity)
      `)
      .in('status', statusFilter)
      .order('created_at', { ascending: true });
    
    // Si no es "all", filtrar por la cocina seleccionada
    if (selectedKitchen !== 'all') {
      query = query.eq('kitchen_id', selectedKitchen);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error cargando órdenes:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    // Formato para la visualización
    const formattedOrders: OrderDisplay[] = data.map((order) => {
      // Fecha formateada
      const dateObj = new Date(order.created_at);
      const formattedTime = dateObj.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return {
        id: order.id,
        customerName: order.customer_name,
        table: order.table_number ? order.table_number.toString() : 'Delivery',
        status: normalizeOrderStatus(order.status),
        time: formattedTime,
        kitchenId: order.kitchen_id || 'main',
        items: order.order_items || [],
        createdAt: order.created_at,
        orderSource: order.order_source
      };
    });
    
    console.log(`Se cargaron ${formattedOrders.length} órdenes`);
    return formattedOrders;
  } catch (error) {
    console.error('Error al cargar órdenes de cocina:', error);
    return [];
  }
};

export const updateOrderStatusInKitchen = async (
  orderId: string,
  newStatus: string,
  hasPermission: boolean
): Promise<boolean> => {
  if (!hasPermission) {
    console.error('Usuario sin permisos para actualizar órdenes');
    toast.error('No tienes permisos para realizar esta acción');
    return false;
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error actualizando estado de orden:', error);
      toast.error('Error al actualizar el estado');
      return false;
    }
    
    toast.success(`Estado actualizado a: ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error en actualización de estado:', error);
    toast.error('Error al actualizar el estado');
    return false;
  }
};

export const getAveragePreparationTime = (kitchenId: string): number => {
  // This would be a real DB query in a complete implementation
  // For demo, return a randomized average between 10-20 minutes
  return Math.floor(Math.random() * 10) + 10;
};

export const getKitchenName = (kitchenId: string, kitchenOptions: KitchenOption[] = []): string => {
  if (!kitchenId) return 'Cocina Principal';
  
  const kitchen = kitchenOptions.find(k => k.id === kitchenId);
  return kitchen ? kitchen.name : 'Cocina Principal';
};
