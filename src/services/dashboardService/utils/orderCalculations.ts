
import { ORDER_STATUSES } from './statusConstants';

export const calculateOrderCounts = (ordersData: any[] | null) => {
  if (!ordersData) return { 
    pendingOrders: 0, 
    inPreparationOrders: 0, 
    readyOrders: 0, 
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  };

  // Filtrar órdenes para incluir solo las de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const ordersFromToday = ordersData.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  });
  
  // Log the order statuses for debugging
  console.log('📊 [OrderCalculations] Order statuses from today:', ordersFromToday.map(order => order.status));
  console.log(`📊 [OrderCalculations] Today's orders count: ${ordersFromToday.length} of ${ordersData.length}`);
  
  // Count each status type using today's orders
  const pendingOrders = ordersFromToday.filter(order => ORDER_STATUSES.pending.includes(order.status.toLowerCase())).length;
  const inPreparationOrders = ordersFromToday.filter(order => ORDER_STATUSES.preparing.includes(order.status.toLowerCase())).length;
  const readyOrders = ordersFromToday.filter(order => ORDER_STATUSES.ready.includes(order.status.toLowerCase())).length;
  const cancelledOrders = ordersFromToday.filter(order => ORDER_STATUSES.cancelled.includes(order.status.toLowerCase())).length;
  const completedOrders = ordersFromToday.filter(order => ORDER_STATUSES.completed.includes(order.status.toLowerCase())).length;

  // Active orders are pending, preparing, and ready orders from today
  const activeOrders = pendingOrders + inPreparationOrders + readyOrders;
  
  // Log the counts for debugging
  console.log('📊 [OrderCalculations] Today\'s counts:', {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    activeOrders,
    cancelledOrders,
    completedOrders
  });

  return {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    activeOrders
  };
};
