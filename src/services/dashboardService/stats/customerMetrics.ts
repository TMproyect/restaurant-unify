
import { supabase } from '@/integrations/supabase/client';

export const getCustomerMetrics = async (todayStart: Date, tomorrowStart: Date) => {
  console.log('📊 [CustomerMetrics] Calculando métricas de clientes');
  
  // Get today's customers
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

  // Calculate unique customers for today
  const uniqueCustomers = new Set(todayCustomers?.map(order => 
    order.customer_name?.toLowerCase()).filter(Boolean));

  console.log(`📊 [CustomerMetrics] Clientes únicos hoy: ${uniqueCustomers.size}`);

  // Calculate yesterday's date range
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayStart);

  // Get yesterday's customers for comparison
  const { data: yesterdayCustomers, error: yesterdayError } = await supabase
    .from('orders')
    .select('customer_name')
    .gte('created_at', yesterdayStart.toISOString())
    .lt('created_at', yesterdayEnd.toISOString())
    .eq('status', 'ready');

  if (yesterdayError) {
    console.error('❌ [CustomerMetrics] Error obteniendo clientes de ayer:', yesterdayError);
    throw yesterdayError;
  }

  // Calculate unique customers for yesterday
  const yesterdayUniqueCustomers = new Set(yesterdayCustomers?.map(order => 
    order.customer_name?.toLowerCase()).filter(Boolean));

  // Calculate change percentage
  const changePercentage = yesterdayUniqueCustomers.size > 0 
    ? ((uniqueCustomers.size - yesterdayUniqueCustomers.size) / yesterdayUniqueCustomers.size) * 100 
    : 0;

  console.log(`📊 [CustomerMetrics] Comparación:
    Hoy: ${uniqueCustomers.size}
    Ayer: ${yesterdayUniqueCustomers.size}
    Cambio: ${changePercentage.toFixed(1)}%`);

  return {
    todayCount: uniqueCustomers.size,
    changePercentage,
    lastUpdated: new Date().toISOString()
  };
};

