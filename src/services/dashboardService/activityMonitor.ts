
import { supabase } from '@/integrations/supabase/client';
import { ActivityMonitorItem } from '@/types/dashboard.types';

/**
 * Función para obtener los datos del monitor de actividad
 * Incluye todos los pedidos con estados relevantes y sus acciones correspondientes
 */
export const getActivityMonitor = async (): Promise<ActivityMonitorItem[]> => {
  try {
    console.log('📊 [DashboardService] Obteniendo datos del monitor de actividad');
    
    // Obtener todas las órdenes con la información necesaria
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        customer_name,
        created_at,
        updated_at,
        total,
        discount,
        items_count,
        external_id,
        kitchen_id
      `)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('❌ [DashboardService] Error al obtener órdenes para el monitor:', ordersError);
      throw ordersError;
    }
    
    console.log(`📊 [DashboardService] Órdenes recuperadas para el monitor: ${orders?.length || 0}`);
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Convertir a formato del monitor de actividad
    const activityItems: ActivityMonitorItem[] = orders.map(order => {
      // Calcular tiempo transcurrido en minutos
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      // Determinar si hay retraso (más de 15 minutos para órdenes pendientes o en preparación)
      const isDelayed = (
        (order.status === 'pending' || 
         order.status === 'preparing' || 
         order.status === 'pendiente' || 
         order.status === 'preparando' || 
         order.status === 'en preparación') && 
        elapsedMinutes > 15
      );
      
      // Determinar si la orden está cancelada
      const hasCancellation = order.status === 'cancelled' || order.status === 'cancelado';
      
      // Determinar si hay descuento
      const hasDiscount = order.discount && order.discount > 0;
      const discountPercentage = hasDiscount ? 
        Math.round((order.discount / (order.total + order.discount)) * 100) : 0;
      
      // Definir las acciones disponibles según el estado
      const actions = [];
      
      // Agregar acción de visualizar para todas las órdenes
      actions.push(`view:${order.id}`);
      
      // Agregar acciones específicas según el estado
      if (order.status === 'pending' || order.status === 'pendiente') {
        actions.push(`prioritize:${order.id}`);
      }
      
      if (order.status !== 'cancelled' && order.status !== 'cancelado') {
        actions.push(`review-cancel:${order.id}`);
      }
      
      if (!hasDiscount) {
        actions.push(`review-discount:${order.id}`);
      }
      
      return {
        id: order.id,
        type: 'order', // Explicitly set the type as required by ActivityMonitorItem
        customer: order.customer_name,
        status: order.status,
        timestamp: order.created_at,
        total: order.total || 0,
        itemsCount: order.items_count || 0,
        timeElapsed: elapsedMinutes,
        isDelayed,
        hasCancellation,
        hasDiscount,
        discountPercentage,
        actions,
        // Include kitchen_id for better kitchen integration
        kitchenId: order.kitchen_id || ''
      };
    });
    
    console.log(`✅ [DashboardService] Items de actividad generados: ${activityItems.length}`);
    return activityItems;
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener monitor de actividad:', error);
    throw error;
  }
};

/**
 * Prioriza una orden en la cocina
 * @param orderId ID de la orden a priorizar
 * @returns true si se realizó correctamente, false en caso contrario
 */
export const prioritizeOrder = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`🔄 [DashboardService] Priorizando orden ${orderId}`);
    
    // Obtener estado actual de la orden
    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('status, kitchen_id')
      .eq('id', orderId)
      .single();
    
    if (getError) {
      console.error('❌ [DashboardService] Error al obtener orden para priorizar:', getError);
      throw getError;
    }
    
    if (!order) {
      console.error(`❌ [DashboardService] Orden ${orderId} no encontrada`);
      return false;
    }
    
    // Determinar nuevo estado priorizado
    let newStatus = order.status;
    if (order.status === 'pending' || order.status === 'pendiente') {
      newStatus = 'priority-pending';
    } else if (order.status === 'preparing' || order.status === 'preparando' || order.status === 'en preparación') {
      newStatus = 'priority-preparing';
    }
    
    // Actualizar estado solo si cambió
    if (newStatus !== order.status) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('❌ [DashboardService] Error al priorizar orden:', updateError);
        throw updateError;
      }
      
      console.log(`✅ [DashboardService] Orden ${orderId} priorizada correctamente a "${newStatus}"`);
      return true;
    }
    
    console.log(`ℹ️ [DashboardService] La orden ${orderId} ya estaba en un estado que no se puede priorizar`);
    return true;
  } catch (error) {
    console.error('❌ [DashboardService] Error al priorizar orden:', error);
    return false;
  }
};
