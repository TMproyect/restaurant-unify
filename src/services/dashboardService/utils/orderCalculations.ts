
import { isWithinToday } from './dateRangeUtils';
import { 
  isActiveStatus, 
  isPendingStatus, 
  isPreparingStatus, 
  isReadyStatus,
  isCompletedStatus,
  isCancelledStatus
} from '../constants/orderStatuses';

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
  const ordersFromToday = ordersData.filter(order => isWithinToday(order.created_at));
  
  console.log('📊 [OrderCalculations] Order statuses from today:', ordersFromToday.map(order => order.status));
  console.log(`📊 [OrderCalculations] Today's orders count: ${ordersFromToday.length} of ${ordersData.length}`);
  
  // Contar cada tipo de estado usando las funciones de utilidad
  const pendingOrders = ordersFromToday.filter(order => isPendingStatus(order.status)).length;
  const inPreparationOrders = ordersFromToday.filter(order => isPreparingStatus(order.status)).length;
  const readyOrders = ordersFromToday.filter(order => isReadyStatus(order.status)).length;
  
  // En el dashboard, completedOrders NO incluye ready (son separados)
  const completedOrders = ordersFromToday.filter(order => 
    isCompletedStatus(order.status) && !isReadyStatus(order.status)
  ).length;
  
  const cancelledOrders = ordersFromToday.filter(order => isCancelledStatus(order.status)).length;

  // Active orders son solo pending y preparing orders de hoy (no ready)
  const activeOrders = pendingOrders + inPreparationOrders;
  
  console.log('📊 [OrderCalculations] Today\'s counts:', {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    activeOrders,
    completedOrders,
    cancelledOrders
  });

  return {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    activeOrders,
    completedOrders,
    cancelledOrders
  };
};
