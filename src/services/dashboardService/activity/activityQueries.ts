
import { supabase } from '@/integrations/supabase/client';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { 
  isActiveStatus, 
  isPendingStatus, 
  isPreparingStatus, 
  isReadyStatus,
  isCompletedStatus,
  isCancelledStatus
} from '../constants/orderStatuses';

export const getActivityMonitor = async (): Promise<ActivityMonitorItem[]> => {
  try {
    console.log('📊 [DashboardService] Fetching activity monitor data (optimized)');
    
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
      
      // Check if it's a pending order
      const status = order.status.toLowerCase();
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

      // Check if the order has a priority prefix
      const isPrioritized = status.startsWith('priority-');
      
      // Use enhanced delay thresholds
      const isDelayed = timeElapsedMs > delayThreshold && 
        (isPendingStatus || isPreparingStatus);
      
      const hasCancellation = status.includes('cancel');
      
      // Calculate discount percentage locally
      const hasDiscount = order.discount && order.discount > 0;
      const discountPercentage = hasDiscount ? 
        Math.round((order.discount / (order.total + order.discount)) * 100) : 0;
      
      // Generate actions based on status - all logic performed locally
      const actions = [];
      actions.push(`view:${order.id}`);
      
      if (isPendingStatus || isPreparingStatus) {
        if (!isPrioritized) {
          actions.push(`prioritize:${order.id}`);
        }
      }
      
      if (!hasCancellation) {
        actions.push(`review-cancel:${order.id}`);
      }
      
      if (hasDiscount && discountPercentage >= 15) {
        actions.push(`review-discount:${order.id}`);
      }

      return {
        id: order.id,
        type: 'order',
        customer: order.customer_name,
        status: status,
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
        isPrioritized
      };
    });
    
    console.log(`✅ [DashboardService] Activity data processed: ${activityItems.length} items`);
    return activityItems;
  } catch (error) {
    console.error('❌ [DashboardService] Error in activity monitor:', error);
    throw error;
  }
};
