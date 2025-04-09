
import { supabase } from '@/integrations/supabase/client';

export const getOrdersStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas de órdenes');
    
    // Get orders with better status breakdown - include completed orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .in('status', [
        'pending', 'preparing', 'ready', 
        'priority-pending', 'priority-preparing',
        'completed', 'delivered'
      ]);
    
    if (ordersError) throw ordersError;
    
    const pendingOrders = ordersData?.filter(order => 
      order.status === 'pending' || order.status === 'priority-pending'
    ).length || 0;
    
    const preparingOrders = ordersData?.filter(order => 
      order.status === 'preparing' || order.status === 'priority-preparing'
    ).length || 0;
    
    const readyOrders = ordersData?.filter(order => 
      order.status === 'ready'
    ).length || 0;
    
    const completedOrders = ordersData?.filter(order => 
      order.status === 'completed' || order.status === 'delivered'
    ).length || 0;
    
    const activeOrders = pendingOrders + preparingOrders + readyOrders;
    
    return {
      activeOrders,
      pendingOrders,
      inPreparationOrders: preparingOrders,
      readyOrders,
      completedOrders,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas de órdenes:', error);
    throw error;
  }
};
