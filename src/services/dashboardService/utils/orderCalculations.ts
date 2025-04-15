
import { isWithinToday } from './dateRangeUtils';
import { 
  isActiveStatus, 
  isPendingStatus, 
  isPreparingStatus, 
  isReadyStatus 
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
  
  // Contar cada tipo de estado usando las funciones de utilidad mejoradas
  const pendingOrders = ordersFromToday.filter(order => isPendingStatus(order.status)).length;
  const inPreparationOrders = ordersFromToday.filter(order => isPreparingStatus(order.status)).length;
  const readyOrders = ordersFromToday.filter(order => isReadyStatus(order.status)).length;

  // Active orders son pending, preparing, y ready orders de hoy
  const activeOrders = pendingOrders + inPreparationOrders + readyOrders;
  
  console.log('📊 [OrderCalculations] Today\'s counts:', {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    activeOrders
  });

  return {
    pendingOrders,
    inPreparationOrders,
    readyOrders,
    activeOrders,
    completedOrders: 0, // Si necesitamos contar estos, añadir función similar
    cancelledOrders: 0  // Si necesitamos contar estos, añadir función similar
  };
};
