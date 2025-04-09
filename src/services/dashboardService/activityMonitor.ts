
import { supabase } from '@/integrations/supabase/client';
import { ActivityMonitorItem } from '@/types/dashboard.types';

// Get order activity with exception monitoring
export const getActivityMonitor = async (limit = 20): Promise<ActivityMonitorItem[]> => {
  try {
    console.log('🔍 [DashboardService] Obteniendo monitor de actividad con detección de excepciones');
    
    // Get recent orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (ordersError) throw ordersError;
    
    // Set thresholds for exceptions
    const delayThresholdMinutes = 15; // Orders pending/preparing for more than X minutes
    const highDiscountThreshold = 15; // Discount percentage considered high
    
    // Process orders to detect exceptions
    const now = new Date();
    
    const activityItems = orders?.map(order => {
      // Calculate time elapsed
      const createdAt = new Date(order.created_at);
      const timeElapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      // Check for delays
      const isDelayed = (
        order.status === 'pending' || 
        order.status === 'preparing' || 
        order.status === 'priority-pending' || 
        order.status === 'priority-preparing'
      ) && timeElapsedMinutes > delayThresholdMinutes;
      
      // Check for discounts
      const hasDiscount = order.discount && order.discount > 0;
      const isHighDiscount = hasDiscount && order.discount >= highDiscountThreshold;
      
      // Determine actions based on status and exceptions
      const actions = [];
      
      // All orders have view details action
      actions.push({
        label: 'Ver Detalles',
        action: `view:${order.id}`,
        type: 'default'
      });
      
      // Add special actions for exceptions
      if (isDelayed && (
        order.status === 'pending' || 
        order.status === 'preparing'
      )) {
        actions.push({
          label: 'Priorizar',
          action: `prioritize:${order.id}`,
          type: 'warning'
        });
      }
      
      // Add cancel action for active orders
      if (
        order.status === 'pending' || 
        order.status === 'preparing' ||
        order.status === 'priority-pending' || 
        order.status === 'priority-preparing'
      ) {
        actions.push({
          label: 'Cancelar',
          action: `cancel:${order.id}`,
          type: 'danger'
        });
      }
      
      if (order.status === 'cancelled') {
        actions.push({
          label: 'Revisar Cancelación',
          action: `review-cancel:${order.id}`,
          type: 'danger'
        });
      }
      
      if (isHighDiscount) {
        actions.push({
          label: 'Ver Descuento',
          action: `review-discount:${order.id}`,
          type: 'warning'
        });
      }
      
      return {
        id: order.id,
        type: 'order' as const,
        status: order.status,
        customer: order.customer_name,
        total: order.total,
        timestamp: order.created_at,
        timeElapsed: timeElapsedMinutes,
        isDelayed,
        hasCancellation: order.status === 'cancelled',
        hasDiscount,
        discountPercentage: order.discount,
        itemsCount: order.items_count,
        actions,
        appliedBy: 'Sistema' // In a real app, get this from the database
      };
    });
    
    return activityItems || [];
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener monitor de actividad:', error);
    return [];
  }
};

// Function for prioritizing orders
export const prioritizeOrder = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`🔍 [DashboardService] Priorizando orden ${orderId}`);
    
    // Get the current order status
    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
    
    if (getError) {
      console.error(`❌ [DashboardService] Error al obtener orden ${orderId}:`, getError);
      await new Promise(resolve => setTimeout(resolve, 800)); // Add delay for demo purposes
      return true; // Return success for demo
    }
    
    // Only prioritize pending or preparing orders
    if (order && (order.status === 'pending' || order.status === 'preparing')) {
      // Update the status to indicate priority
      // Here we're using a status prefix "priority-" to indicate it's prioritized
      const newStatus = `priority-${order.status}`;
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select('id')
        .single();
      
      if (error) {
        console.error(`❌ [DashboardService] Error al priorizar orden ${orderId}:`, error);
        await new Promise(resolve => setTimeout(resolve, 800)); // Add delay for demo purposes
        return true; // Return success for demo
      }
      
      return !!data;
    }
    
    // If the order can't be prioritized (e.g., already delivered),
    // we'll still return success for the demo
    console.log(`ℹ️ [DashboardService] Orden ${orderId} no puede ser priorizada (estado: ${order?.status})`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  } catch (error) {
    console.error(`❌ [DashboardService] Error al priorizar orden ${orderId}:`, error);
    // In a production app, we would throw the error here
    // But for demo purposes, we'll delay and return a success
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }
};
