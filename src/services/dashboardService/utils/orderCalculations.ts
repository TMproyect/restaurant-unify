
import { ORDER_STATUSES } from './statusConstants';

export const calculateOrderCounts = (ordersData: any[] | null) => {
  if (!ordersData) return { 
    pendingOrders: 0, 
    inPreparationOrders: 0, 
    readyOrders: 0, 
    activeOrders: 0
  };

  // Log the order statuses for debugging
  console.log('📊 [OrderCalculations] Order statuses:', ordersData.map(order => order.status));
  
  // Count each status type
  const pendingOrders = ordersData.filter(order => ORDER_STATUSES.pending.includes(order.status.toLowerCase())).length;
  const inPreparationOrders = ordersData.filter(order => ORDER_STATUSES.preparing.includes(order.status.toLowerCase())).length;
  const readyOrders = ordersData.filter(order => ORDER_STATUSES.ready.includes(order.status.toLowerCase())).length;
  const cancelledOrders = ordersData.filter(order => ORDER_STATUSES.cancelled.includes(order.status.toLowerCase())).length;
  const completedOrders = ordersData.filter(order => ORDER_STATUSES.completed.includes(order.status.toLowerCase())).length;

  // Active orders are ONLY pending and preparing
  const activeOrders = pendingOrders + inPreparationOrders;
  
  // Log the counts for debugging
  console.log('📊 [OrderCalculations] Counts:', {
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
