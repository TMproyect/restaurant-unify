
import { DashboardStats } from '@/types/dashboard.types';
import { supabase } from '@/integrations/supabase/client';

// Optimized function to get all dashboard statistics in a single database call
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardService] Fetching all dashboard stats in optimized single query');
    
    // Define status groups for consistent categorization
    const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
    const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
    const readyStatuses = ['ready', 'listo', 'lista'];
    const completedStatuses = ['completed', 'delivered', 'completado', 'entregado', 'paid'];
    
    // Get today's date boundaries for calculations
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    // Single efficient query to get all orders - we'll process everything locally
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at, updated_at, customer_name, total, discount')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('❌ [DashboardService] Error fetching orders for stats:', ordersError);
      throw ordersError;
    }
    
    console.log(`📊 [DashboardService] Retrieved ${allOrders?.length || 0} orders for stats processing`);
    
    // Process all statistics from the same dataset locally
    // This eliminates multiple queries and N+1 problems
    
    // Filter active orders
    const pendingOrders = allOrders?.filter(order => pendingStatuses.includes(order.status)) || [];
    const preparingOrders = allOrders?.filter(order => preparingStatuses.includes(order.status)) || [];
    const readyOrders = allOrders?.filter(order => readyStatuses.includes(order.status)) || [];
    
    // CORRECTED: Active orders are ONLY pending and preparing orders
    const activeOrders = pendingOrders.length + preparingOrders.length;
    
    // Filter for today's sales (completed orders today)
    const todaySales = allOrders?.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart && orderDate <= now && 
             completedStatuses.includes(order.status);
    }) || [];
    
    console.log(`📊 [DashboardService] Today's completed orders found: ${todaySales.length}`);
    console.log('📊 [DashboardService] Today's orders sample:', todaySales.slice(0, 2));
    
    // Calculate today's sales figures
    const dailyTotal = todaySales.reduce((sum, order) => sum + (order.total || 0), 0);
    const transactionCount = todaySales.length;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    console.log(`📊 [DashboardService] Daily total calculated: ${dailyTotal}`);
    
    // Filter for yesterday's sales (for comparison)
    const yesterdaySales = allOrders?.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= yesterdayStart && orderDate <= yesterdayEnd && 
             completedStatuses.includes(order.status);
    }) || [];
    
    // Calculate yesterday's sales for comparison
    const yesterdayTotal = yesterdaySales.reduce((sum, order) => sum + (order.total || 0), 0);
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    // Get unique customers today (from completed orders)
    const uniqueCustomers = new Set();
    todaySales.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    const todayCustomerCount = uniqueCustomers.size;
    
    console.log(`📊 [DashboardService] Unique customers today: ${todayCustomerCount}`);
    if (todayCustomerCount > 0) {
      console.log(`📊 [DashboardService] Sample customers: ${Array.from(uniqueCustomers).slice(0, 3)}`);
    }
    
    // Get unique customers yesterday
    const yesterdayUniqueCustomers = new Set();
    yesterdaySales.forEach(order => {
      if (order.customer_name) {
        yesterdayUniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    const yesterdayCustomerCount = yesterdayUniqueCustomers.size;
    const customerChangePercentage = yesterdayCustomerCount > 0
      ? ((todayCustomerCount - yesterdayCustomerCount) / yesterdayCustomerCount) * 100
      : 0;
    
    // In a separate query, get popular items information, but with optimized select
    const { data: orderItemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id, 
        name, 
        menu_item_id, 
        quantity, 
        order_id, 
        orders!inner(status)
      `)
      .in('orders.status', completedStatuses)
      .limit(100); // Limit to a reasonable number to avoid excessive data transfer
    
    if (itemsError) {
      console.error('❌ [DashboardService] Error fetching popular items:', itemsError);
      // Continue with empty popular items rather than failing the whole dashboard
    }
    
    // Process popular items locally
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
      .slice(0, 5); // Get top 5 items
    
    console.log('✅ [DashboardService] All dashboard stats calculated efficiently');
    console.log('📊 [DashboardService] Popular items:', popularItems);
    
    // Compile all statistics into a single return object
    return {
      salesStats: {
        dailyTotal,
        transactionCount,
        averageTicket,
        changePercentage,
        lastUpdated: new Date().toISOString()
      },
      ordersStats: {
        activeOrders,
        pendingOrders: pendingOrders.length,
        inPreparationOrders: preparingOrders.length,
        readyOrders: readyOrders.length,
        lastUpdated: new Date().toISOString()
      },
      customersStats: {
        todayCount: todayCustomerCount,
        changePercentage: customerChangePercentage,
        lastUpdated: new Date().toISOString()
      },
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error getting dashboard stats:', error);
    // Return default stats to prevent dashboard from failing
    return getDefaultDashboardStats();
  }
};

// Helper function for default stats
function getDefaultDashboardStats(): DashboardStats {
  return {
    salesStats: {
      dailyTotal: 0,
      transactionCount: 0,
      averageTicket: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString()
    },
    ordersStats: {
      activeOrders: 0,
      pendingOrders: 0,
      inPreparationOrders: 0,
      readyOrders: 0,
      lastUpdated: new Date().toISOString()
    },
    customersStats: {
      todayCount: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString()
    },
    popularItems: []
  };
}

// No duplicate export here - we only export the main function once
