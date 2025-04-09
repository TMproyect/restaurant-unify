
import { supabase } from '@/integrations/supabase/client';

export const getCustomersStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas de clientes');
    
    // Get today's boundaries
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    
    // Get today's unique customers from completed and delivered orders
    const { data: todayCustomers, error: todayError } = await supabase
      .from('orders')
      .select('customer_name')
      .gte('created_at', todayStart.toISOString())
      .in('status', ['completed', 'delivered']);
    
    if (todayError) throw todayError;
    
    // Get yesterday's customers for comparison
    const { data: yesterdayCustomers, error: yesterdayError } = await supabase
      .from('orders')
      .select('customer_name')
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString())
      .in('status', ['completed', 'delivered']);
    
    if (yesterdayError) throw yesterdayError;
    
    // Calculate unique customers
    const todayCount = new Set(todayCustomers?.map(o => o.customer_name.toLowerCase())).size;
    const yesterdayCount = new Set(yesterdayCustomers?.map(o => o.customer_name.toLowerCase())).size;
    
    // Calculate change percentage
    const changePercentage = yesterdayCount > 0 
      ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 
      : 0;
    
    return {
      todayCount,
      changePercentage,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas de clientes:', error);
    throw error;
  }
};
