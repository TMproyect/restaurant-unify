
import { supabase } from '@/integrations/supabase/client';
import { mapArrayResponse } from '@/utils/supabaseHelpers';
import { filterValue } from '@/utils/supabaseHelpers';
import { Order } from '@/types/order.types';
import { OrderDisplay } from '@/components/kitchen/kitchenTypes';
import { 
  normalizeOrderStatus, 
  getDBStatusesFromUIStatus, 
  isDbStatusMatchingUiStatus,
  NormalizedOrderStatus,
  UI_STATUS_MAP,
  getStatusLabel
} from '@/utils/orderStatusUtils';
import { toast } from 'sonner';
import { updateOrderStatus } from '@/services/orders/orderUpdates';

/**
 * Carga órdenes desde Supabase para el módulo de cocina
 * @param selectedKitchen Cocina seleccionada
 * @param dbStatuses Estados de la orden en la base de datos
 * @param hasViewPermission Si el usuario tiene permisos de visualización
 * @returns Promesa con las órdenes formateadas
 */
export const loadKitchenOrders = async (
  selectedKitchen: string,
  dbStatuses: string[],
  hasViewPermission: boolean
): Promise<OrderDisplay[]> => {
  if (!hasViewPermission) return [];
  
  try {
    console.log(`🔍 [Kitchen] Loading orders for kitchen ${selectedKitchen} with statuses:`, dbStatuses);
    
    // Construir la consulta base
    let query = supabase
      .from('orders')
      .select(`
        id,
        table_number,
        customer_name,
        status,
        is_delivery,
        kitchen_id,
        created_at,
        updated_at,
        order_items (
          id,
          name,
          quantity,
          notes
        )
      `);
    
    // Filtrar por cocina seleccionada si no es "all"
    if (selectedKitchen !== "all") {
      query = query.eq('kitchen_id', filterValue(selectedKitchen));
    }
    
    // Agregar filtro de estado si hay estados definidos
    if (dbStatuses && dbStatuses.length > 0) {
      query = query.in('status', dbStatuses);
    }
    
    // Ejecutar la consulta
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [Kitchen] Error loading orders:', error);
      throw error;
    }
    
    console.log(`✅ [Kitchen] Received ${data?.length || 0} orders from Supabase with statuses:`, 
      data?.map(d => d.status));
    
    if (!data) {
      return [];
    }
    
    // Map and ensure we have data with proper type
    type ExtendedOrder = Order & { order_items: any[] };
    const typedData = mapArrayResponse<ExtendedOrder>(data, 'Failed to map orders for kitchen');
    
    // Formatear las órdenes para el componente
    const formattedOrders: OrderDisplay[] = typedData.map(order => ({
      id: order.id || '',
      table: order.is_delivery ? 'Delivery' : String(order.table_number || ''),
      customerName: order.customer_name || 'Cliente',
      time: new Date(order.created_at || '').toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      kitchenId: order.kitchen_id || 'main',
      status: normalizeOrderStatus(order.status || 'pending'),
      items: (order.order_items || []).map((item: any) => ({
        name: item.name || 'Sin nombre',
        notes: item.notes || '',
        id: item.id || '',
        quantity: item.quantity || 1
      }))
    }));
    
    console.log('✅ [Kitchen] Formatted orders:', formattedOrders);
    return formattedOrders;
  } catch (error) {
    console.error('❌ [Kitchen] Error loading orders:', error);
    toast.error('Error al cargar los pedidos para cocina');
    return [];
  }
};

/**
 * Actualiza el estado de una orden
 * @param orderId ID de la orden a actualizar
 * @param newStatus Nuevo estado
 * @param hasManagePermission Si el usuario tiene permisos de gestión
 * @returns Promesa con el resultado de la operación
 */
export const updateOrderStatusInKitchen = async (
  orderId: string, 
  newStatus: NormalizedOrderStatus,
  hasManagePermission: boolean
): Promise<boolean> => {
  if (!hasManagePermission) {
    toast.error("No tienes permisos para actualizar el estado de órdenes");
    return false;
  }
  
  try {
    // Convertir a estado de base de datos
    const dbStatus = UI_STATUS_MAP[newStatus];
    console.log(`🔄 [Kitchen] Updating order ${orderId} status to ${newStatus} (DB: ${dbStatus})`);
    
    const success = await updateOrderStatus(orderId, dbStatus);
    
    if (success) {
      toast.success(`Estado de la orden actualizado a "${getStatusLabel(newStatus)}"`);
      return true;
    } else {
      console.error('❌ [Kitchen] Failed to update order status');
      toast.error("No se pudo actualizar el estado de la orden");
      return false;
    }
  } catch (error) {
    console.error('❌ [Kitchen] Error updating order status:', error);
    toast.error("Ocurrió un error al actualizar el estado");
    return false;
  }
};

/**
 * Obtiene el nombre de la cocina desde su ID
 * @param kitchenId ID de la cocina
 * @param kitchenOptions Opciones de cocina disponibles
 * @returns Nombre de la cocina
 */
export const getKitchenName = (
  kitchenId: string, 
  kitchenOptions: { id: string, name: string }[]
): string => {
  const kitchen = kitchenOptions.find(k => k.id === kitchenId);
  return kitchen ? kitchen.name : 'Desconocida';
};

/**
 * Calcula el tiempo promedio de preparación (datos simulados)
 * @param selectedKitchen Cocina seleccionada
 * @returns Tiempo promedio en minutos
 */
export const getAveragePreparationTime = (selectedKitchen: string): number => {
  // En una app real, esto se calcularía de datos reales
  const times: Record<string, number> = {
    'all': 15,
    'main': 15,
    'grill': 18,
    'cold': 10,
    'pastry': 20,
    'bar': 12
  };
  
  return times[selectedKitchen] || 15;
};
