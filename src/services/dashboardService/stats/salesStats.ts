
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
    
    // Get today's sales from completed and delivered orders
    const { data: todaySalesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total, status')
      .gte('created_at', todayStart.toISOString())
      .in('status', ['completed', 'delivered']);
    
    if (salesError) throw salesError;
    
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    // Get yesterday's sales for comparison
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .in('status', ['completed', 'delivered']);
    
    if (yesterdayError) throw yesterdayError;
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    console.log('✅ [DashboardService] Sales stats calculated:', {
      dailyTotal,
      transactionCount,
      averageTicket,
      changePercentage
    });
    
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
