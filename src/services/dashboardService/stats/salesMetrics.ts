
import { supabase } from '@/integrations/supabase/client';

export const getSalesMetrics = async (todayStart: Date, tomorrowStart: Date) => {
  console.log('📊 [SalesMetrics] Calculando métricas de ventas');
  
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

  const dailyTotal = todaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const transactionCount = todaySales?.length || 0;
  const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;

  return {
    dailyTotal,
    transactionCount,
    averageTicket,
    lastUpdated: new Date().toISOString()
  };
};
