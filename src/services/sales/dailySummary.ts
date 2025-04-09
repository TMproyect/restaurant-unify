
import { supabase } from '@/integrations/supabase/client';
import { SalesSummary } from './types';

// Fetch daily sales summary
export const getDailySalesSummary = async (date?: string): Promise<SalesSummary> => {
  try {
    console.log('Fetching daily sales summary for date:', date || 'today');
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Fetch orders that are paid or completed for the specified date
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado'])
      .gte('updated_at', `${targetDate}T00:00:00`)
      .lte('updated_at', `${targetDate}T23:59:59`);

    if (todayError) {
      console.error('Error fetching today\'s orders:', todayError);
      return {
        daily_total: 0,
        transactions_count: 0,
        average_sale: 0,
        cancellations: 0
      };
    }

    // Calculate daily metrics
    const dailyTotal = todayOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionsCount = todayOrders?.length || 0;
    const averageSale = transactionsCount > 0 ? dailyTotal / transactionsCount : 0;

    // Get count of cancelled orders
    const { count: cancellations, error: cancelError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['cancelled', 'cancelado'])
      .gte('updated_at', `${targetDate}T00:00:00`)
      .lte('updated_at', `${targetDate}T23:59:59`);

    if (cancelError) {
      console.error('Error fetching cancelled orders:', cancelError);
      return {
        daily_total: dailyTotal,
        transactions_count: transactionsCount,
        average_sale: averageSale,
        cancellations: 0
      };
    }

    // Calculate growth rate (comparing with previous day)
    const previousDate = new Date(targetDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const prevDateStr = previousDate.toISOString().split('T')[0];
    
    const { data: prevOrders, error: prevError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado'])
      .gte('updated_at', `${prevDateStr}T00:00:00`)
      .lte('updated_at', `${prevDateStr}T23:59:59`);
    
    let growthRate = 0;
    
    if (!prevError && prevOrders) {
      const prevTotal = prevOrders.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      if (prevTotal > 0) {
        growthRate = ((dailyTotal - prevTotal) / prevTotal) * 100;
      }
    }

    console.log('Daily summary calculated:', {
      dailyTotal,
      transactionsCount,
      averageSale,
      cancellations,
      growthRate
    });

    return {
      daily_total: dailyTotal,
      transactions_count: transactionsCount,
      average_sale: averageSale,
      cancellations: cancellations || 0,
      growth_rate: growthRate
    };
  } catch (error) {
    console.error('Error getting daily sales summary:', error);
    return {
      daily_total: 0,
      transactions_count: 0,
      average_sale: 0,
      cancellations: 0
    };
  }
};
