
import { DashboardStats } from '@/types/dashboard.types';
import { getOrdersByDateRange, getOrderItems } from './utils/dbQueries';
import { getTodayDateRange, getYesterdayDateRange } from './utils/dateUtils';
import { calculateOrderCounts } from './utils/orderCalculations';
import { getUniqueCustomers } from './utils/customerCalculations';
import { ORDER_STATUSES } from './utils/statusConstants';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardStats] Iniciando cálculo de estadísticas');
    
    const { start: todayStart, end: tomorrowStart } = getTodayDateRange();
    const { start: yesterdayStart, end: yesterdayEnd } = getYesterdayDateRange(todayStart);
    
    // Get orders data
    const { data: ordersData, error: ordersError } = await getOrdersByDateRange(
      todayStart,
      tomorrowStart,
      [...ORDER_STATUSES.pending, ...ORDER_STATUSES.preparing, ...ORDER_STATUSES.ready]
    );
    
    if (ordersError) throw ordersError;
    
    // Get today's and yesterday's sales data
    const { data: todaySales, error: salesError } = await getOrdersByDateRange(todayStart, tomorrowStart);
    if (salesError) throw salesError;
    
    const { data: yesterdaySales, error: yesterdayError } = await getOrdersByDateRange(yesterdayStart, yesterdayEnd);
    if (yesterdayError) throw yesterdayError;
    
    // Calculate order metrics
    const {
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      activeOrders
    } = calculateOrderCounts(ordersData);
    
    // Calculate sales totals
    const dailyTotal = todaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySales?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    // Calculate yesterday totals for comparison
    const yesterdayTotal = yesterdaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    // Calculate customer metrics
    const uniqueCustomers = getUniqueCustomers(todaySales);
    const yesterdayUniqueCustomers = getUniqueCustomers(yesterdaySales);
    
    const todayCustomerCount = uniqueCustomers.size;
    const yesterdayCustomerCount = yesterdayUniqueCustomers.size;
    const customerChangePercentage = yesterdayCustomerCount > 0
      ? ((todayCustomerCount - yesterdayCustomerCount) / yesterdayCustomerCount) * 100
      : 0;
    
    // Get popular items
    // Convert readonly array to mutable array using spread operator
    const { data: orderItemsData, error: itemsError } = await getOrderItems(
      Array.from(ORDER_STATUSES.completed)
    );
    
    if (itemsError) {
      console.error('❌ [DashboardService] Error en consulta de items populares:', itemsError);
      throw itemsError;
    }
    
    // Calculate item popularity
    const itemCountMap = new Map();
    orderItemsData?.forEach(item => {
      const itemId = item.menu_item_id || item.name;
      const count = itemCountMap.get(itemId) || { name: item.name, quantity: 0, id: itemId };
      count.quantity += item.quantity;
      itemCountMap.set(itemId, count);
    });
    
    const popularItems = Array.from(itemCountMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
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
