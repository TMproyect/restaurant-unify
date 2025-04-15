
import { supabase } from '@/integrations/supabase/client';

export const getSalesMetrics = async (todayStart: Date, tomorrowStart: Date) => {
  console.log('📊 [SalesMetrics] Calculando métricas de ventas');
  
  // Get today's sales data
  const { data: todaySales, error } = await supabase
    .from('orders')
    .select('id, total, status, created_at')
    .gte('created_at', todayStart.toISOString())
    .lt('created_at', tomorrowStart.toISOString())
    .eq('status', 'ready');

  if (error) {
    console.error('❌ [SalesMetrics] Error obteniendo ventas:', error);
    throw error;
  }

  console.log(`📊 [SalesMetrics] Ventas encontradas: ${todaySales?.length || 0}`);

  // Calculate today's metrics
  const dailyTotal = todaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const transactionCount = todaySales?.length || 0;
  const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;

  // Calculate yesterday's date range
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayStart);

  // Get yesterday's sales data
  const { data: yesterdaySales, error: yesterdayError } = await supabase
    .from('orders')
    .select('id, total, status')
    .gte('created_at', yesterdayStart.toISOString())
    .lt('created_at', yesterdayEnd.toISOString())
    .eq('status', 'ready');

  if (yesterdayError) {
    console.error('❌ [SalesMetrics] Error obteniendo ventas de ayer:', yesterdayError);
    throw yesterdayError;
  }

  // Calculate yesterday's metrics for comparison
  const yesterdayTotal = yesterdaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  
  // Calculate change percentage
  const changePercentage = yesterdayTotal > 0 
    ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
    : 0;

  console.log(`📊 [SalesMetrics] Comparación:
    Hoy: $${dailyTotal}
    Ayer: $${yesterdayTotal}
    Cambio: ${changePercentage.toFixed(1)}%`);

  return {
    dailyTotal,
    transactionCount,
    averageTicket,
    changePercentage,
    lastUpdated: new Date().toISOString()
  };
};

