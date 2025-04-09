
import { supabase } from '@/integrations/supabase/client';
import { KitchenOption, OrderDisplay } from '@/components/kitchen/types';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';
import { toast } from 'sonner';
import { safeArray, safeGet } from '@/utils/safetyUtils';

export const loadKitchenOrders = async (
  selectedKitchen: string,
  statusFilter: string[],
  hasPermission: boolean
): Promise<OrderDisplay[]> => {
  if (!hasPermission) {
    console.error('Usuario sin permisos para cargar órdenes de cocina');
    toast.error('No tienes permisos para ver órdenes de cocina');
    return [];
  }

  try {
    // Validate input parameters
    if (!selectedKitchen) {
      console.error('Kitchen ID no válido:', selectedKitchen);
      throw new Error('Kitchen ID no válido');
    }
    
    if (!Array.isArray(statusFilter) || statusFilter.length === 0) {
      console.error('Filtros de estado inválidos:', statusFilter);
      throw new Error('Filtros de estado inválidos');
    }
    
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
      toast.error(`Error al cargar órdenes: ${error.message}`);
      throw error;
    }
    
    if (!data) {
      console.log('No se encontraron órdenes para los filtros aplicados');
      return [];
    }
    
    // Formato para la visualización
    const formattedOrders: OrderDisplay[] = data.map((order) => {
      try {
        // Validar que los datos requeridos existen
        if (!order.id) {
          console.warn('Orden sin ID detectada, la omitimos');
          return null;
        }
        
        // Fecha formateada
        let formattedTime = '';
        try {
          const dateObj = new Date(order.created_at);
          if (isNaN(dateObj.getTime())) {
            console.warn(`Fecha inválida para orden ${order.id}: ${order.created_at}`);
            formattedTime = 'Fecha desconocida';
          } else {
            formattedTime = dateObj.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } catch (dateError) {
          console.error(`Error al formatear fecha para orden ${order.id}:`, dateError);
          formattedTime = 'Error de fecha';
        }
        
        return {
          id: order.id,
          customerName: order.customer_name || 'Cliente sin nombre',
          table: order.table_number ? order.table_number.toString() : 'Delivery',
          status: normalizeOrderStatus(order.status || 'pending'),
          time: formattedTime,
          kitchenId: order.kitchen_id || 'main',
          items: safeArray(order.order_items),
          createdAt: order.created_at,
          orderSource: null // Since we can't query order_source yet, default to null
        };
      } catch (orderError) {
        console.error(`Error procesando orden ${order?.id || 'desconocida'}:`, orderError);
        return null;
      }
    }).filter(Boolean) as OrderDisplay[]; // Filter out null values
    
    console.log(`Se cargaron ${formattedOrders.length} órdenes`);
    return formattedOrders;
  } catch (error) {
    console.error('Error al cargar órdenes de cocina:', error);
    toast.error(`Error al cargar órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
    // Validar parámetros
    if (!orderId) {
      console.error('ID de orden inválido:', orderId);
      toast.error('ID de orden inválido');
      return false;
    }
    
    if (!newStatus) {
      console.error('Estado nuevo inválido:', newStatus);
      toast.error('Estado nuevo inválido');
      return false;
    }
    
    console.log(`Actualizando orden ${orderId} a estado: ${newStatus}`);
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error actualizando estado de orden:', error);
      toast.error(`Error al actualizar el estado: ${error.message}`);
      return false;
    }
    
    toast.success(`Estado actualizado a: ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error en actualización de estado:', error);
    toast.error(`Error al actualizar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return false;
  }
};

export const getAveragePreparationTime = (kitchenId: string): number => {
  try {
    // Validar parámetros
    if (!kitchenId) {
      console.warn('Kitchen ID inválido para getAveragePreparationTime:', kitchenId);
      return 15; // Default fallback value
    }
    
    // This would be a real DB query in a complete implementation
    // For demo, return a randomized average between 10-20 minutes
    return Math.floor(Math.random() * 10) + 10;
  } catch (error) {
    console.error('Error al obtener tiempo de preparación promedio:', error);
    return 15; // Default fallback value
  }
};

export const getKitchenName = (kitchenId: string, kitchenOptions: KitchenOption[] = []): string => {
  try {
    if (!kitchenId) return 'Cocina Principal';
    
    // Validate kitchenOptions is an array
    if (!Array.isArray(kitchenOptions)) {
      console.warn('kitchenOptions no es un array:', kitchenOptions);
      return 'Cocina Principal';
    }
    
    const kitchen = kitchenOptions.find(k => k && k.id === kitchenId);
    return kitchen ? kitchen.name : 'Cocina Principal';
  } catch (error) {
    console.error('Error al obtener nombre de cocina:', error);
    return 'Cocina Principal';
  }
};
