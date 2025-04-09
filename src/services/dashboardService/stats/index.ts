
import { getSalesStats } from './salesStats';
import { getOrdersStats } from './ordersStats';
import { getCustomersStats } from './customersStats';
import { getPopularItems } from './popularItems';
import { DashboardStats } from '@/types/dashboard.types';

// Get all dashboard statistics combined
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas completas del dashboard');
    
    // Execute all stats queries in parallel for better performance
    const [salesStats, ordersStats, customersStats, popularItems] = await Promise.all([
      getSalesStats(),
      getOrdersStats(),
      getCustomersStats(),
      getPopularItems()
    ]);
    
    // Combine all stats into a single object
    return {
      salesStats,
      ordersStats,
      customersStats,
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas completas:', error);
    throw error;
  }
};

// Export individual stats functions
export {
  getSalesStats,
  getOrdersStats,
  getCustomersStats,
  getPopularItems
};
