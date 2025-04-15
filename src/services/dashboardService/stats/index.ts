
import { DashboardStats } from '@/types/dashboard.types';
import { getSalesMetrics } from './salesMetrics';
import { getOrderMetrics } from './orderMetrics';
import { getCustomerMetrics } from './customerMetrics';
import { getPopularItemsMetrics } from './popularItemsMetrics';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardStats] Iniciando cálculo de estadísticas');
    
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [
      salesMetrics,
      orderMetrics,
      customerMetrics,
      popularItems
    ] = await Promise.all([
      getSalesMetrics(todayStart, tomorrowStart),
      getOrderMetrics(),
      getCustomerMetrics(todayStart, tomorrowStart),
      getPopularItemsMetrics()
    ]);

    console.log('✅ [DashboardStats] Estadísticas calculadas exitosamente');

    return {
      salesStats: {
        ...salesMetrics,
        changePercentage: 0 // We'll implement this later if needed
      },
      ordersStats: orderMetrics,
      customersStats: {
        ...customerMetrics,
        changePercentage: 0 // We'll implement this later if needed
      },
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardStats] Error al obtener estadísticas:', error);
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
