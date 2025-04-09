
import { supabase } from '@/integrations/supabase/client';
import { HourlySalesData } from './types';

// Get sales data by hour of day
export const getSalesByHour = async (period: number = 30): Promise<HourlySalesData[]> => {
  try {
    console.log(`Fetching sales by hour for last ${period} days`);
    
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString();
    
    // Get paid orders in the period
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado'])
      .gte('updated_at', startDateStr)
      .lte('updated_at', endDate);
    
    if (error) {
      console.error('Error fetching orders for hourly data:', error);
      return [];
    }
    
    // Initialize hourly data for all hours
    const hourlyData: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      const hourLabel = i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
      hourlyData[hourLabel] = 0;
    }
    
    // Aggregate data by hour
    data?.forEach(order => {
      if (order.updated_at) {
        const date = new Date(order.updated_at);
        const hour = date.getHours();
        const hourLabel = hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
        
        hourlyData[hourLabel] = (hourlyData[hourLabel] || 0) + (order.total || 0);
      }
    });
    
    // Convert to array format
    return Object.entries(hourlyData)
      .map(([hour, sales]) => ({ hour, sales }))
      .sort((a, b) => {
        // Sort by hour (AM/PM format)
        const hourA = a.hour.includes('AM') 
          ? parseInt(a.hour.split(' ')[0])
          : (parseInt(a.hour.split(' ')[0]) === 12 ? 12 : parseInt(a.hour.split(' ')[0]) + 12);
        
        const hourB = b.hour.includes('AM')
          ? parseInt(b.hour.split(' ')[0])
          : (parseInt(b.hour.split(' ')[0]) === 12 ? 12 : parseInt(b.hour.split(' ')[0]) + 12);
        
        return hourA - hourB;
      });
  } catch (error) {
    console.error('Error getting sales by hour:', error);
    return [];
  }
};
