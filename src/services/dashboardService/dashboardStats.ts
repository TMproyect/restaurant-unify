
import { DashboardStats } from '@/types/dashboard.types';
import { getOrdersByDateRange, getOrderItems } from './utils/dbQueries';
import { getTodayDateRange, getYesterdayDateRange } from './utils/dateUtils';
import { calculateOrderCounts } from './utils/orderCalculations';
import { getUniqueCustomers } from './utils/customerCalculations';
import { calculateSalesMetrics, calculatePopularItems } from './utils/metricsCalculations';
import { ORDER_STATUSES } from './utils/statusConstants';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardStats] Iniciando cálculo de estadísticas');
    
    const { start: todayStart, end: tomorrowStart } = getTodayDateRange();
    const { start: yesterdayStart, end: yesterdayEnd } = getYesterdayDateRange(todayStart);
    
    console.log(`📊 [DashboardStats] Rango de fecha: ${todayStart.toISOString()} a ${tomorrowStart.toISOString()}`);
    
    // Obtener pedidos activos (solo del día de hoy)
    const { data: ordersData, error: ordersError } = await getOrdersByDateRange(
      todayStart,
      tomorrowStart,
      // Obtener todos los estados activos para el dashboard
      [...ORDER_STATUSES.pending, ...ORDER_STATUSES.preparing, ...ORDER_STATUSES.ready]
    );
    
    if (ordersError) throw ordersError;
    
    // Get today's and yesterday's sales data
    const { data: todaySales, error: salesError } = await getOrdersByDateRange(todayStart, tomorrowStart);
    if (salesError) throw salesError;
    
    const { data: yesterdaySales, error: yesterdayError } = await getOrdersByDateRange(yesterdayStart, yesterdayEnd);
    if (yesterdayError) throw yesterdayError;
    
    // Calculate metrics using utility functions
    const orderCounts = calculateOrderCounts(ordersData);
    const salesMetrics = calculateSalesMetrics(todaySales, yesterdaySales);
    
    // Calculate customer metrics
    const uniqueCustomers = getUniqueCustomers(todaySales);
    const yesterdayUniqueCustomers = getUniqueCustomers(yesterdaySales);
    
    const todayCustomerCount = uniqueCustomers.size;
    const yesterdayCustomerCount = yesterdayUniqueCustomers.size;
    const customerChangePercentage = yesterdayCustomerCount > 0
      ? ((todayCustomerCount - yesterdayCustomerCount) / yesterdayCustomerCount) * 100
      : 0;
    
    // Get popular items
    const { data: orderItemsData, error: itemsError } = await getOrderItems(
      Array.from(ORDER_STATUSES.completed)
    );
    
    if (itemsError) {
      console.error('❌ [DashboardService] Error en consulta de items populares:', itemsError);
      throw itemsError;
    }
    
    const popularItems = calculatePopularItems(orderItemsData);
    const lastUpdated = new Date().toISOString();
    
    console.log('📊 [DashboardStats] Recuentos calculados:', orderCounts);
    
    return {
      salesStats: {
        ...salesMetrics,
        lastUpdated
      },
      ordersStats: {
        activeOrders: orderCounts.activeOrders,
        pendingOrders: orderCounts.pendingOrders,
        inPreparationOrders: orderCounts.inPreparationOrders,
        readyOrders: orderCounts.readyOrders,
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
