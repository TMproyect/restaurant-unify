
import { supabase } from '@/integrations/supabase/client';

export const getCustomerMetrics = async (todayStart: Date, tomorrowStart: Date) => {
  console.log('📊 [CustomerMetrics] Calculando métricas de clientes');
  
  const { data: todayCustomers, error } = await supabase
    .from('orders')
    .select('customer_name')
    .gte('created_at', todayStart.toISOString())
    .lt('created_at', tomorrowStart.toISOString())
    .eq('status', 'ready');

  if (error) {
    console.error('❌ [CustomerMetrics] Error obteniendo clientes:', error);
    throw error;
  }

  const uniqueCustomers = new Set(todayCustomers?.map(order => 
    order.customer_name?.toLowerCase()).filter(Boolean));

  console.log(`📊 [CustomerMetrics] Clientes únicos: ${uniqueCustomers.size}`);

  return {
    todayCount: uniqueCustomers.size,
    lastUpdated: new Date().toISOString()
  };
};
