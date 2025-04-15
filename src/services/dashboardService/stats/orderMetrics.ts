
import { supabase } from '@/integrations/supabase/client';

const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
const readyStatuses = ['ready', 'listo', 'lista'];

export const getOrderMetrics = async () => {
  console.log('📊 [OrderMetrics] Calculando métricas de órdenes');
  
  // Obtener solo órdenes de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, created_at')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (error) {
    console.error('❌ [OrderMetrics] Error obteniendo órdenes:', error);
    throw error;
  }

  // Log unique statuses for debugging
  const uniqueStatuses = [...new Set(orders.map(order => order.status))];
  console.log('📊 [OrderMetrics] Estados encontrados:', uniqueStatuses);
  console.log(`📊 [OrderMetrics] Total de órdenes hoy: ${orders.length}`);

  const pendingOrders = orders.filter(order => pendingStatuses.includes(order.status)).length;
  const preparingOrders = orders.filter(order => preparingStatuses.includes(order.status)).length;
  const readyOrders = orders.filter(order => readyStatuses.includes(order.status)).length;

  // Active orders include pending, preparing, and ready orders
  const activeOrders = pendingOrders + preparingOrders + readyOrders;

  return {
    activeOrders,
    pendingOrders,
    inPreparationOrders: preparingOrders,
    readyOrders,
    lastUpdated: new Date().toISOString()
  };
};
