
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
      const isDelayed = (order.status === 'pending' || order.status === 'preparing') && 
                        timeElapsedMinutes > delayThresholdMinutes;
      
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
      if (isDelayed) {
        actions.push({
          label: 'Priorizar',
          action: `prioritize:${order.id}`,
          type: 'warning'
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
        actions
      };
    });
    
    return activityItems || [];
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener monitor de actividad:', error);
    return [];
  }
};

// Mock API endpoint for prioritizing orders
export const prioritizeOrder = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`🔍 [DashboardService] Priorizando orden ${orderId}`);
    
    // This would be a real API call in production
    // In this mock, we'll just add an artificial delay to simulate the API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success
    return true;
  } catch (error) {
    console.error(`❌ [DashboardService] Error al priorizar orden ${orderId}:`, error);
    return false;
  }
};
