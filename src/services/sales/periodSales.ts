
import { supabase } from '@/integrations/supabase/client';
import { SalesData } from './types';

// Fetch sales by period (daily, weekly, monthly)
export const getSalesByPeriod = async (period: 'daily' | 'weekly' | 'monthly', limit: number = 7): Promise<SalesData[]> => {
  try {
    console.log(`Fetching ${period} sales with limit: ${limit}`);
    
    const now = new Date();
    let result: SalesData[] = [];
    
    // Generate dates based on period
    for (let i = 0; i < limit; i++) {
      const date = new Date(now);
      
      if (period === 'daily') {
        date.setDate(date.getDate() - i);
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - (i * 7));
      } else if (period === 'monthly') {
        date.setMonth(date.getMonth() - i);
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const startDate = `${dateStr}T00:00:00`;
      const endDate = `${dateStr}T23:59:59`;
      
      // Fetch orders for this date range - only include completed/paid orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado'])
        .gte('updated_at', startDate)
        .lte('updated_at', endDate);
      
      if (error) {
        console.error(`Error fetching ${period} sales for ${dateStr}:`, error);
        continue;
      }
      
      const total = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const transactions = orders?.length || 0;
      
      result.push({
        date: dateStr,
        total,
        transactions
      });
    }
    
    return result.reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error(`Error getting ${period} sales:`, error);
    return [];
  }
};
