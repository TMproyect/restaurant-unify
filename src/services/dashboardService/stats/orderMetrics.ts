
import { supabase } from '@/integrations/supabase/client';

const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
const readyStatuses = ['ready', 'listo', 'lista'];

export const getOrderMetrics = async () => {
  console.log('📊 [OrderMetrics] Calculando métricas de órdenes');
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status');

  if (error) {
    console.error('❌ [OrderMetrics] Error obteniendo órdenes:', error);
    throw error;
  }

  // Log unique statuses for debugging
  const uniqueStatuses = [...new Set(orders.map(order => order.status))];
  console.log('📊 [OrderMetrics] Estados encontrados:', uniqueStatuses);

  const pendingOrders = orders.filter(order => pendingStatuses.includes(order.status)).length;
  const preparingOrders = orders.filter(order => preparingStatuses.includes(order.status)).length;
  const readyOrders = orders.filter(order => readyStatuses.includes(order.status)).length;

  // Active orders are only pending and preparing orders
  const activeOrders = pendingOrders + preparingOrders;

  return {
    activeOrders,
    pendingOrders,
    inPreparationOrders: preparingOrders,
    readyOrders,
    lastUpdated: new Date().toISOString()
  };
};
