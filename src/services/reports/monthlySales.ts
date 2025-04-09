
import { supabase } from '@/integrations/supabase/client';
import { MonthlySalesData } from './types';

// Get sales data by month
export const getSalesByMonth = async (months: number = 6): Promise<MonthlySalesData[]> => {
  try {
    console.log(`Fetching monthly sales for last ${months} months`);
    
    const result: MonthlySalesData[] = [];
    const now = new Date();
    
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    // Generate data for each month
    for (let i = 0; i < months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      
      // Get orders for this month
      const { data, error } = await supabase
        .from('orders')
        .select('total')
        .in('status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado'])
        .gte('updated_at', startDate)
        .lte('updated_at', endDate);
      
      if (error) {
        console.error(`Error fetching sales for ${monthNames[month]} ${year}:`, error);
        continue;
      }
      
      // Calculate total sales
      const monthlySales = data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      result.push({
        month: `${monthNames[month]} ${year !== new Date().getFullYear() ? year : ''}`.trim(),
        sales: monthlySales
      });
    }
    
    return result.reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Error getting monthly sales:', error);
    return [];
  }
};
