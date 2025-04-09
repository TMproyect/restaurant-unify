
import { OrderDisplay, KitchenStats } from '@/components/kitchen/types';

/**
 * Calcula estadísticas para la cocina seleccionada
 * @param orders Lista de órdenes
 * @returns Estadísticas de la cocina
 */
export const calculateKitchenStats = (orders: OrderDisplay[]): KitchenStats => {
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
      const created = new Date(order.createdAt).getTime();
      const completedTimestamp = new Date().getTime(); // Assuming current time for completed orders
      const elapsedMinutes = (completedTimestamp - created) / (1000 * 60);
      
      totalTime += elapsedMinutes;
      completedCount++;
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
  return orders.filter(order => {
    if (orderStatus === 'pending') {
      return order.status === 'pending';
    } else if (orderStatus === 'preparing') {
      return order.status === 'preparing';
    } else if (orderStatus === 'ready') {
      return order.status === 'ready' || order.status === 'delivered';
    }
    return false;
  });
};
