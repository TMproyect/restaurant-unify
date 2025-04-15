
import { ORDER_STATUSES } from './statusConstants';

export const calculateOrderCounts = (ordersData: any[] | null) => {
  if (!ordersData) return { 
    pendingOrders: 0, 
    inPreparationOrders: 0, 
    readyOrders: 0, 
    activeOrders: 0
  };

  const pendingOrders = ordersData.filter(order => ORDER_STATUSES.pending.includes(order.status)).length;
  const inPreparationOrders = ordersData.filter(order => ORDER_STATUSES.preparing.includes(order.status)).length;
  const readyOrders = ordersData.filter(order => ORDER_STATUSES.ready.includes(order.status)).length;
  const cancelledOrders = ordersData.filter(order => ORDER_STATUSES.cancelled.includes(order.status)).length;
  const completedOrders = ordersData.filter(order => ORDER_STATUSES.completed.includes(order.status)).length;

  return {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    activeOrders: pendingOrders + inPreparationOrders // Active orders are ONLY pending and preparing
  };
};
