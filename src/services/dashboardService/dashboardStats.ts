
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/dashboard.types';

// Function to obtain detailed dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas detalladas del dashboard');
    
    // Get today's date boundaries
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    // Get active orders with status breakdown
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .in('status', ['pending', 'preparing', 'ready']);
    
    if (ordersError) throw ordersError;
    
    const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
    const preparingOrders = ordersData?.filter(order => order.status === 'preparing').length || 0;
    const readyOrders = ordersData?.filter(order => order.status === 'ready').length || 0;
    const activeOrders = pendingOrders + preparingOrders + readyOrders;
    
    // Get today's sales with transaction count
    const { data: todaySalesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total, status')
      .gte('created_at', todayStart.toISOString())
      .eq('status', 'completed');
    
    if (salesError) throw salesError;
    
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    // Get yesterday's sales for comparison
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .eq('status', 'completed');
    
    if (yesterdayError) throw yesterdayError;
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    // Get unique customers today
    const { data: customersData, error: customersError } = await supabase
      .from('orders')
      .select('customer_name')
      .gte('created_at', todayStart.toISOString())
      .eq('status', 'completed');
    
    if (customersError) throw customersError;
    
    // Count unique customers
    const uniqueCustomers = new Set();
    customersData?.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    // Get popular items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: orderItemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        name,
        menu_item_id,
        quantity,
        order_id,
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', sevenDaysAgo.toISOString())
      .eq('orders.status', 'completed');
    
    if (itemsError) throw itemsError;
    
    // Calculate item popularity
    const itemCountMap = new Map();
    orderItemsData?.forEach(item => {
      const itemId = item.menu_item_id || item.name;
      const count = itemCountMap.get(itemId) || { name: item.name, quantity: 0, id: itemId };
      count.quantity += item.quantity;
      itemCountMap.set(itemId, count);
    });
    
    // Convert to array and sort by quantity
    const popularItems = Array.from(itemCountMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    const lastUpdated = new Date().toISOString();
    
    return {
      salesStats: {
        dailyTotal,
        transactionCount,
        averageTicket,
        changePercentage,
        lastUpdated
      },
      ordersStats: {
        activeOrders,
        pendingOrders,
        inPreparationOrders: preparingOrders,
        readyOrders,
        lastUpdated
      },
      customersStats: {
        todayCount: uniqueCustomers.size,
        changePercentage: 0, // Would need previous day data for comparison
        lastUpdated
      },
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas:', error);
    throw error;
  }
};
