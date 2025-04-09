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
  
  return { 
    pendingItems: pendingOrders.length, 
    preparingItems: preparingOrders.length, 
    completedItems: completedOrders.length,
    totalItems: orders.length
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
