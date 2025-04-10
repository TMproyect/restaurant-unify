
import { supabase } from '@/integrations/supabase/client';

export const getSalesStats = async () => {
  try {
    console.log('📊 [SalesStats] Retrieving daily sales statistics...');
    
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    console.log(`📊 [SalesStats] Today's date range: ${todayStart.toISOString()} to ${new Date().toISOString()}`);
    console.log(`📊 [SalesStats] Yesterday's date range: ${yesterdayStart.toISOString()} to ${yesterdayEnd.toISOString()}`);
    
    // Get today's sales - IMPORTANT: Include "listo" and "lista" statuses
    const { data: todaySalesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', todayStart.toISOString())
      .in('status', ['completed', 'delivered', 'completado', 'entregado', 'paid', 'pagado', 'listo', 'lista', 'ready']);
    
    if (salesError) {
      console.error('❌ [SalesStats] Error fetching today sales:', salesError);
      throw salesError;
    }
    
    // Debug - Log the found orders with their status for troubleshooting
    console.log(`📊 [SalesStats] Today's sales data found (${todaySalesData?.length || 0} records):`);
    todaySalesData?.forEach(order => {
      console.log(`  - Order ID: ${order.id.substring(0, 6)}... | Status: ${order.status} | Total: ${order.total}`);
    });
    
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    console.log(`📊 [SalesStats] Calculated daily total: ${dailyTotal}`);
    console.log(`📊 [SalesStats] Transaction count: ${transactionCount}`);
    
    // Get yesterday's sales with the same status inclusion
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .in('status', ['completed', 'delivered', 'completado', 'entregado', 'paid', 'pagado', 'listo', 'lista', 'ready']);
    
    if (yesterdayError) {
      console.error('❌ [SalesStats] Error fetching yesterday sales:', yesterdayError);
      throw yesterdayError;
    }
    
    console.log(`📊 [SalesStats] Yesterday's sales count: ${yesterdaySalesData?.length || 0}`);
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    
    // Avoid division by zero
    let changePercentage = 0;
    if (yesterdayTotal > 0) {
      changePercentage = ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100;
    } else if (dailyTotal > 0) {
      // If yesterday was 0 but today has sales, show 100% increase
      changePercentage = 100;
    }
    
    console.log(`📊 [SalesStats] Yesterday total: ${yesterdayTotal}`);
    console.log(`📊 [SalesStats] Change percentage: ${changePercentage.toFixed(2)}%`);
    
    return {
      dailyTotal,
      transactionCount,
      averageTicket,
      changePercentage,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [SalesStats] Error calculating sales statistics:', error);
    // Return default values instead of throwing so the dashboard still renders
    return {
      dailyTotal: 0,
      transactionCount: 0,
      averageTicket: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};
