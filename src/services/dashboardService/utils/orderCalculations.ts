
import { ORDER_STATUSES } from './statusConstants';

export const calculateOrderCounts = (ordersData: any[] | null) => {
  if (!ordersData) return { pendingOrders: 0, preparingOrders: 0, readyOrders: 0, completedOrders: 0, cancelledOrders: 0 };

  const pendingOrders = ordersData.filter(order => ORDER_STATUSES.pending.includes(order.status)).length;
  const preparingOrders = ordersData.filter(order => ORDER_STATUSES.preparing.includes(order.status)).length;
  const readyOrders = ordersData.filter(order => ORDER_STATUSES.ready.includes(order.status)).length;
  const cancelledOrders = ordersData.filter(order => ORDER_STATUSES.cancelled.includes(order.status)).length;
  const completedOrders = ordersData.filter(order => ORDER_STATUSES.completed.includes(order.status)).length;

  return {
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    activeOrders: pendingOrders + preparingOrders // Active orders are ONLY pending and preparing
  };
};
