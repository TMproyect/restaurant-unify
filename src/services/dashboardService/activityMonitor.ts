
import { supabase } from '@/integrations/supabase/client';
import { ActivityMonitorItem } from '@/types/dashboard.types';

/**
 * Optimized function to get activity monitor data with all necessary related data in a single query
 * Uses proper JOINs to prevent N+1 query problems
 */
export const getActivityMonitor = async (): Promise<ActivityMonitorItem[]> => {
  try {
    console.log('📊 [DashboardService] Fetching activity monitor data (optimized)');
    
    // Get orders with all necessary data in a single query
    // Use proper JOINs to avoid N+1 queries for related data
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
        kitchen_id,
        order_source
      `)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('❌ [DashboardService] Error fetching activity data:', ordersError);
      throw ordersError;
    }
    
    console.log(`✅ [DashboardService] Activity data fetched in a single query: ${orders?.length || 0} items`);
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Process the data locally without additional network requests
    const activityItems: ActivityMonitorItem[] = orders.map(order => {
      // Calculate time elapsed in milliseconds
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const timeElapsedMs = now.getTime() - createdAt.getTime();
      
      // Enhanced thresholds by status
      const status = order.status.toLowerCase();
      
      // Check if it's a pending order
      const isPendingStatus = status === 'pending' || 
                             status === 'priority-pending' || 
                             status === 'pendiente';
      
      // Check if it's a preparing order                       
      const isPreparingStatus = status === 'preparing' || 
                               status === 'priority-preparing' || 
                               status === 'preparando' || 
                               status === 'en preparación';
                               
      // Determine delay thresholds based on status
      let delayThreshold = 15 * 60 * 1000; // Default 15 minutes
      
      if (isPendingStatus) {
        delayThreshold = 10 * 60 * 1000; // 10 minutes for pending
      } else if (isPreparingStatus) {
        delayThreshold = 20 * 60 * 1000; // 20 minutes for preparing
      }
      
      // Determine status flags locally
      const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
      const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
      const readyStatuses = ['ready', 'listo', 'lista'];
      const completedStatuses = ['completed', 'delivered', 'completado', 'entregado', 'paid'];
      const cancelledStatuses = ['cancelled', 'cancelado', 'cancelada'];
      
      // Check if the order has a priority prefix
      const isPrioritized = status.startsWith('priority-');
      
      // CORRECCIÓN: Considerar pedidos 'ready' como 'completed' para el monitor de actividad
      const normalizedStatus = readyStatuses.includes(status) ? 'completed' : status;
      
      // Use enhanced delay thresholds
      const isDelayed = timeElapsedMs > delayThreshold && 
        (pendingStatuses.includes(status) || preparingStatuses.includes(status));
      
      const hasCancellation = cancelledStatuses.includes(status);
      
      // Calculate discount percentage locally
      const hasDiscount = order.discount && order.discount > 0;
      const discountPercentage = hasDiscount ? 
        Math.round((order.discount / (order.total + order.discount)) * 100) : 0;
      
      // Generate actions based on status - all logic performed locally
      const actions = [];
      actions.push(`view:${order.id}`);
      
      if (pendingStatuses.includes(status) || preparingStatuses.includes(status)) {
        // Only show prioritize option if not already prioritized
        if (!isPrioritized) {
          actions.push(`prioritize:${order.id}`);
        }
      }
      
      if (!cancelledStatuses.includes(status)) {
        actions.push(`review-cancel:${order.id}`);
      }
      
      if (hasDiscount && discountPercentage >= 15) {
        actions.push(`review-discount:${order.id}`);
      }
      
      // Create complete activity item with all required data without additional API calls
      return {
        id: order.id,
        type: 'order',
        customer: order.customer_name,
        status: normalizedStatus, // Usar el estado normalizado
        timestamp: order.created_at,
        total: order.total || 0,
        itemsCount: order.items_count || 0,
        timeElapsed: timeElapsedMs,
        isDelayed,
        hasCancellation,
        hasDiscount,
        discountPercentage: hasDiscount ? discountPercentage : undefined,
        actions,
        kitchenId: order.kitchen_id || '',
        orderSource: order.order_source || 'pos',
        isPrioritized // Add the prioritized flag to the activity item
      };
    });
    
    console.log(`✅ [DashboardService] Activity data processed: ${activityItems.length} items`);
    return activityItems;
  } catch (error) {
    console.error('❌ [DashboardService] Error in activity monitor:', error);
    throw error;
  }
};

/**
 * Optimized function to prioritize an order
 */
export const prioritizeOrder = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`🔄 [DashboardService] Prioritizing order ${orderId}`);
    
    // Get current status in a single query
    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('status, id')
      .eq('id', orderId)
      .single();
    
    if (getError) {
      console.error('❌ [DashboardService] Error getting order:', getError);
      throw getError;
    }
    
    if (!order) {
      console.error(`❌ [DashboardService] Order ${orderId} not found`);
      return false;
    }
    
    // Determine new status with mejor manejo de priorización
    let newStatus = order.status;
    const normalizedStatus = order.status.toLowerCase();
    
    if (normalizedStatus === 'pending' || normalizedStatus === 'pendiente') {
      newStatus = 'priority-pending';
    } else if (normalizedStatus === 'preparing' || normalizedStatus === 'preparando' || normalizedStatus === 'en preparación') {
      newStatus = 'priority-preparing';
    } else if (normalizedStatus.includes('pend')) {
      newStatus = 'priority-pending';
    } else if (normalizedStatus.includes('prepar')) {
      newStatus = 'priority-preparing';
    }
    
    console.log(`🔄 [DashboardService] Cambiando estado de orden ${orderId} de "${order.status}" a "${newStatus}"`);
    
    // Update only if status changed
    if (newStatus !== order.status) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('❌ [DashboardService] Error prioritizing order:', updateError);
        throw updateError;
      }
      
      console.log(`✅ [DashboardService] Order ${orderId} prioritized to "${newStatus}"`);
      return true;
    } else {
      console.log(`⚠️ [DashboardService] Order ${orderId} status was not changed because it's already in an appropriate state`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ [DashboardService] Error prioritizing order:', error);
    return false;
  }
};

// Add a scheduled task to check for outdated orders
export const setupAutoArchiving = async () => {
  try {
    // This function can be used to set up a recurring task using setInterval
    // However, it's better to use the edge function with a cron job
    console.log('📊 [DashboardService] Auto-archiving setup is managed through Supabase Edge Function');
    return true;
  } catch (error) {
    console.error('❌ [DashboardService] Error setting up auto-archiving:', error);
    return false;
  }
};
