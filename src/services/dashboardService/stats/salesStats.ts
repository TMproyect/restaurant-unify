
import { supabase } from '@/integrations/supabase/client';

export const getSalesStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas de ventas');
    
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    console.log(`📊 [DashboardService] Fecha inicio de hoy: ${todayStart.toISOString()}`);
    
    // Get today's sales from completed and delivered orders
    const { data: todaySalesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', todayStart.toISOString())
      .in('status', ['completed', 'delivered', 'completado', 'entregado']);
    
    if (salesError) {
      console.error('❌ [DashboardService] Error al obtener ventas de hoy:', salesError);
      throw salesError;
    }
    
    console.log(`📊 [DashboardService] Ventas de hoy encontradas: ${todaySalesData?.length || 0}`);
    
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    console.log(`📊 [DashboardService] Total ventas de hoy: ${dailyTotal}`);
    console.log(`📊 [DashboardService] Número de transacciones: ${transactionCount}`);
    
    // Get yesterday's sales for comparison
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .in('status', ['completed', 'delivered', 'completado', 'entregado']);
    
    if (yesterdayError) {
      console.error('❌ [DashboardService] Error al obtener ventas de ayer:', yesterdayError);
      throw yesterdayError;
    }
    
    console.log(`📊 [DashboardService] Ventas de ayer encontradas: ${yesterdaySalesData?.length || 0}`);
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    console.log(`📊 [DashboardService] Cambio porcentual: ${changePercentage.toFixed(2)}%`);
    
    return {
      dailyTotal,
      transactionCount,
      averageTicket,
      changePercentage,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas de ventas:', error);
    throw error;
  }
};
