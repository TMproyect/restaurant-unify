
import { supabase } from '@/integrations/supabase/client';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { mapOrderToActivityItem } from './utils/activityMapper';

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
    
    // Map orders to activity items using our dedicated mapper
    const activityItems = orders.map(mapOrderToActivityItem);
    
    console.log(`✅ [DashboardService] Activity data processed: ${activityItems.length} items`);
    return activityItems;
  } catch (error) {
    console.error('❌ [DashboardService] Error in activity monitor:', error);
    throw error;
  }
};
