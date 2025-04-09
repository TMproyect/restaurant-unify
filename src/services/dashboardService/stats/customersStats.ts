
import { supabase } from '@/integrations/supabase/client';

// Get customer statistics for dashboard
export const getCustomersStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas de clientes');
    
    // Get today's date boundaries
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    // Get unique customers today
    const { data: customersData, error: customersError } = await supabase
      .from('orders')
      .select('customer_name')
      .gte('created_at', todayStart.toISOString())
      .eq('status', 'completed');
    
    if (customersError) throw customersError;
    
    // Count unique customers
    const uniqueCustomers = new Set();
    customersData?.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    return {
      todayCount: uniqueCustomers.size,
      changePercentage: 0, // Would need previous day data for comparison
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas de clientes:', error);
    throw error;
  }
};
