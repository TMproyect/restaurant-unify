
import { OrderDisplay, KitchenStats } from '@/components/kitchen/types';
import { toast } from 'sonner';

/**
 * Calcula estadísticas para la cocina seleccionada
 * @param orders Lista de órdenes
 * @returns Estadísticas de la cocina
 */
export const calculateKitchenStats = (orders: OrderDisplay[]): KitchenStats => {
  try {
    // Validate input
    if (!Array.isArray(orders)) {
      console.error('[calculateKitchenStats] Invalid orders parameter - not an array:', orders);
      return getDefaultKitchenStats();
    }
    
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const preparingOrders = orders.filter(order => order.status === 'preparing');
    const completedOrders = orders.filter(order => 
      order.status === 'ready' || order.status === 'delivered'
    );
    const cancelledOrders = orders.filter(order => order.status === 'cancelled');
    
    // Calculate average preparation time
    let totalTime = 0;
    let completedCount = 0;
    
    completedOrders.forEach(order => {
      if (order.createdAt) {
        try {
          const created = new Date(order.createdAt).getTime();
          
          // Validate date parsing
          if (isNaN(created)) {
            console.warn(`[calculateKitchenStats] Invalid date format for order ${order.id}: ${order.createdAt}`);
            return; // Skip this order in calculation
          }
          
          const completedTimestamp = new Date().getTime(); // Assuming current time for completed orders
          const elapsedMinutes = (completedTimestamp - created) / (1000 * 60);
          
          // Validate the calculated time
          if (elapsedMinutes < 0 || elapsedMinutes > 24 * 60) { // More than 24 hours is likely an error
            console.warn(`[calculateKitchenStats] Unrealistic preparation time for order ${order.id}: ${elapsedMinutes} minutes`);
            return; // Skip this order in calculation
          }
          
          totalTime += elapsedMinutes;
          completedCount++;
        } catch (dateError) {
          console.error(`[calculateKitchenStats] Error processing date for order ${order.id}:`, dateError);
        }
      }
    });
    
    const averageTime = completedCount > 0 ? totalTime / completedCount : 0;
    
    return { 
      pendingItems: pendingOrders.length, 
      preparingItems: preparingOrders.length, 
      completedItems: completedOrders.length,
      cancelledItems: cancelledOrders.length,
      totalItems: orders.length,
      totalOrders: orders.length,
      averageTime
    };
  } catch (error) {
    console.error('[calculateKitchenStats] Error calculating kitchen stats:', error);
    return getDefaultKitchenStats();
  }
};

/**
 * Returns default kitchen stats object for fallback
 */
const getDefaultKitchenStats = (): KitchenStats => {
  return {
    pendingItems: 0,
    preparingItems: 0,
    completedItems: 0,
    cancelledItems: 0,
    totalItems: 0,
    totalOrders: 0,
    averageTime: 0
  };
};

/**
 * Filtra órdenes por estado
 * @param orders Lista de órdenes
 * @param orderStatus Estado de filtro
 * @returns Órdenes filtradas
 */
export const filterOrdersByStatus = (
  orders: OrderDisplay[], 
  orderStatus: 'pending' | 'preparing' | 'ready'
): OrderDisplay[] => {
  try {
    // Validate input
    if (!Array.isArray(orders)) {
      console.error('[filterOrdersByStatus] Invalid orders parameter - not an array:', orders);
      return [];
    }
    
    if (!orderStatus) {
      console.error('[filterOrdersByStatus] Invalid or missing orderStatus parameter:', orderStatus);
      return [];
    }
    
    return orders.filter(order => {
      if (!order) {
        console.warn('[filterOrdersByStatus] Encountered undefined or null order in array');
        return false;
      }
      
      if (orderStatus === 'pending') {
        return order.status === 'pending';
      } else if (orderStatus === 'preparing') {
        return order.status === 'preparing';
      } else if (orderStatus === 'ready') {
        return order.status === 'ready' || order.status === 'delivered';
      }
      return false;
    });
  } catch (error) {
    console.error('[filterOrdersByStatus] Error filtering orders:', error);
    return [];
  }
};
