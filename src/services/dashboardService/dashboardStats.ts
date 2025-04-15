import { DashboardStats } from '@/types/dashboard.types';
import { getOrdersByDateRange, getOrderItems } from './utils/dbQueries';
import { getTodayDateRange, getYesterdayDateRange } from './utils/dateUtils';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardStats] Iniciando cálculo de estadísticas');
    
    const { start: todayStart, end: tomorrowStart } = getTodayDateRange();
    const { start: yesterdayStart, end: yesterdayEnd } = getYesterdayDateRange(todayStart);
    
    // Get orders data
    const { data: ordersData, error: ordersError } = await getOrdersByDateRange(
      todayStart,
      tomorrowStart,
      ['pending', 'preparing', 'ready']
    );
    
    if (ordersError) throw ordersError;
    
    // Get today's and yesterday's sales data
    const { data: todaySales, error: salesError } = await getOrdersByDateRange(todayStart, tomorrowStart);
    if (salesError) throw salesError;
    
    const { data: yesterdaySales, error: yesterdayError } = await getOrdersByDateRange(yesterdayStart, yesterdayEnd);
    if (yesterdayError) throw yesterdayError;
    
    // Calculate metrics using existing logic
    // Define status groups for consistent categorization
    const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
    const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
    const readyStatuses = ['ready', 'listo', 'lista'];
    
    // CORRECCIÓN: Usar exactamente 'ready' como único estado que cuenta como completado
    const completedStatuses = ['ready'];
    
    const cancelledStatuses = ['cancelled', 'cancelado', 'cancelada'];
    
    // Count orders by status with consistent categorization
    const pendingOrders = ordersData?.filter(order => pendingStatuses.includes(order.status)).length || 0;
    const preparingOrders = ordersData?.filter(order => preparingStatuses.includes(order.status)).length || 0;
    const readyOrders = ordersData?.filter(order => readyStatuses.includes(order.status)).length || 0;
    const completedOrders = todaySales?.length || 0;
    const cancelledOrders = ordersData?.filter(order => cancelledStatuses.includes(order.status)).length || 0;
    
    // CORRECT: Active orders are ONLY pending and preparing (not ready)
    const activeOrders = pendingOrders + preparingOrders;
    
    // Calculate sales totals
    const dailyTotal = todaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySales?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    // Calculate yesterday totals for comparison
    const yesterdayTotal = yesterdaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    // Get unique customers today with accurate time filter
    // Count unique customer names only from completed/delivered orders
    const uniqueCustomers = new Set();
    todaySales?.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    const todayCustomerCount = uniqueCustomers.size;
    
    // Get unique customers yesterday for comparison
    const yesterdayUniqueCustomers = new Set();
    yesterdaySales?.forEach(order => {
      if (order.customer_name) {
        yesterdayUniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    const yesterdayCustomerCount = yesterdayUniqueCustomers.size;
    const customerChangePercentage = yesterdayCustomerCount > 0
      ? ((todayCustomerCount - yesterdayCustomerCount) / yesterdayCustomerCount) * 100
      : 0;
    
    // Get popular items (all time, not just 7 days) - MODIFIED TO ENSURE RESULTS
    // We'll query order_items directly with no time limit first to ensure we get some data
    const { data: orderItemsData, error: itemsError } = await getOrderItems(completedStatuses);
    
    if (itemsError) {
      console.error('❌ [DashboardService] Error en consulta de items populares:', itemsError);
      throw itemsError;
    }
    
    // Calculate item popularity with detailed logging
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
      .slice(0, 5) // Get top 5 items
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        id: item.id
      }));
    
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
        todayCount: todayCustomerCount,
        changePercentage: customerChangePercentage,
        lastUpdated
      },
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardStats] Error al obtener estadísticas:', error);
    return getDefaultDashboardStats();
  }
};

// Helper function to return default stats object when data can't be loaded
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
