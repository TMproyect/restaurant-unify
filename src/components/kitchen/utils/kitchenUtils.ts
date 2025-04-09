
import { KitchenOption, KitchenStats, KITCHEN_OPTIONS } from '../types/kitchenTypes';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

export const useKitchenUtils = (orders: any[], selectedKitchen: string) => {
  
  // Filter orders based on kitchen and status
  const getFilteredOrders = (status: string) => {
    // Start with filtering by selected kitchen (if not 'all')
    let filtered = orders.filter(order => {
      if (selectedKitchen === 'all') {
        return true;
      }
      return order.kitchenId === selectedKitchen;
    });
    
    // Then filter by status
    return filtered.filter(order => order.status === status);
  };
  
  // Get kitchen statistics (counts and averages)
  const getKitchenStats = (): KitchenStats => {
    // Filter orders for current kitchen
    const kitchenOrders = orders.filter(order => {
      if (selectedKitchen === 'all') {
        return true;
      }
      return order.kitchenId === selectedKitchen;
    });
    
    // Count by status
    const pendingItems = kitchenOrders.filter(order => order.status === 'pending').length;
    const preparingItems = kitchenOrders.filter(order => order.status === 'preparing').length;
    const completedItems = kitchenOrders.filter(order => order.status === 'ready').length;
    const cancelledItems = kitchenOrders.filter(order => order.status === 'cancelled').length;
    
    // Calculate average completion time for completed orders
    let totalTime = 0;
    let completedCount = 0;
    
    kitchenOrders.forEach(order => {
      if (order.status === 'ready' && order.createdAt) {
        const created = new Date(order.createdAt).getTime();
        const completedTimestamp = order.completedAt ? new Date(order.completedAt).getTime() : new Date().getTime();
        const elapsedMinutes = (completedTimestamp - created) / (1000 * 60);
        
        totalTime += elapsedMinutes;
        completedCount++;
      }
    });
    
    const averageTime = completedCount > 0 ? totalTime / completedCount : 0;
    
    return {
      pendingItems,
      preparingItems,
      completedItems,
      cancelledItems,
      totalItems: kitchenOrders.length, // Ensure totalItems is included and properly set
      totalOrders: kitchenOrders.length,
      averageTime
    };
  };
  
  // Format average time for display
  const getAverageTime = (): string => {
    const stats = getKitchenStats();
    
    if (stats.averageTime === 0) {
      return '-- : --';
    }
    
    const minutes = Math.floor(stats.averageTime);
    const seconds = Math.round((stats.averageTime - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get kitchen name from kitchen ID
  const getKitchenName = (kitchenId: string): string => {
    if (kitchenId === 'all') {
      return 'Todas las Cocinas';
    }
    
    const kitchen = KITCHEN_OPTIONS.find(option => option.id === kitchenId);
    return kitchen ? kitchen.name : 'Cocina Desconocida';
  };
  
  return {
    getFilteredOrders,
    getKitchenStats,
    getAverageTime,
    getKitchenName
  };
};
