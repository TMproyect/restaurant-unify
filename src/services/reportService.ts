
import { supabase } from '@/integrations/supabase/client';
import { getMostSoldProducts } from './salesService';

export interface CategorySalesData {
  name: string;
  value: number;
  percentage?: number;
}

export interface HourlySalesData {
  hour: string;
  sales: number;
}

export interface MonthlySalesData {
  month: string;
  sales: number;
}

export interface SavedReport {
  id: number;
  name: string;
  date: string;
  type: 'PDF' | 'Excel';
  url?: string;
}

// Get sales data categorized by menu category
export const getSalesByCategory = async (period: number = 30): Promise<CategorySalesData[]> => {
  try {
    console.log(`Fetching sales by category for last ${period} days`);
    
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString();
    
    // First get all order items in the period with their menu items
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        price, 
        quantity, 
        menu_item_id,
        menu_items!inner(category_id),
        orders!inner(status, updated_at)
      `)
      .gte('orders.updated_at', startDateStr)
      .lte('orders.updated_at', endDate)
      .eq('orders.status', 'paid');
    
    if (error) {
      console.error('Error fetching order items for category data:', error);
      return [];
    }
    
    // Get category names
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('id, name');
    
    if (catError) {
      console.error('Error fetching menu categories:', catError);
      return [];
    }
    
    // Map category IDs to names
    const categoryNames: Record<string, string> = {};
    categories?.forEach(cat => {
      categoryNames[cat.id] = cat.name;
    });
    
    // Group by category
    const categorySales: Record<string, number> = {};
    let otherSales = 0;
    let totalSales = 0;
    
    data?.forEach(item => {
      const categoryId = item.menu_items?.category_id;
      const amount = (item.price || 0) * (item.quantity || 0);
      totalSales += amount;
      
      if (categoryId && categoryNames[categoryId]) {
        const categoryName = categoryNames[categoryId];
        categorySales[categoryName] = (categorySales[categoryName] || 0) + amount;
      } else {
        otherSales += amount;
      }
    });
    
    // Convert to array and calculate percentages
    const result: CategorySalesData[] = Object.entries(categorySales).map(([name, value]) => ({
      name,
      value,
      percentage: totalSales > 0 ? (value / totalSales) * 100 : 0
    }));
    
    // Add "Others" category if there are uncategorized sales
    if (otherSales > 0) {
      result.push({
        name: 'Otros',
        value: otherSales,
        percentage: totalSales > 0 ? (otherSales / totalSales) * 100 : 0
      });
    }
    
    return result.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error getting sales by category:', error);
    return [];
  }
};

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
      .eq('status', 'paid')
      .gte('updated_at', startDateStr)
      .lte('updated_at', endDate);
    
    if (error) {
      console.error('Error fetching orders for hourly data:', error);
      return [];
    }
    
    // Initialize hourly data for all hours
    const hourlyData: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
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
        .eq('status', 'paid')
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

// Get saved reports (this would be implemented with a reports table in Supabase)
export const getSavedReports = async (): Promise<SavedReport[]> => {
  // In a real application, this would fetch from a reports table
  // For now, returning sample data
  return [
    { id: 1, name: 'Ventas Mensuales 2023', date: '2023-12-01', type: 'Excel' },
    { id: 2, name: 'Análisis de Productos Q2', date: '2023-07-15', type: 'PDF' },
    { id: 3, name: 'Rendimiento de Personal', date: '2023-09-30', type: 'Excel' },
    { id: 4, name: 'Inventario Trimestral', date: '2023-10-01', type: 'PDF' },
  ];
};

// Export a report (this would generate and save a report in a real app)
export const exportReport = async (
  reportType: string, 
  format: 'PDF' | 'Excel', 
  dateRange: { start: string, end: string }
): Promise<string> => {
  console.log(`Exporting ${reportType} report in ${format} format for ${dateRange.start} to ${dateRange.end}`);
  
  // In a real application, this would generate the report and return a download URL
  // For now, we'll just simulate this with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock URL
  return `/mock-reports/${reportType}-${format.toLowerCase()}-${Date.now()}.${format.toLowerCase()}`;
};

// Update Reports.tsx to use the service
export const updateReportsPage = async () => {
  try {
    const [categorySales, hourlySales, monthlySales] = await Promise.all([
      getSalesByCategory(),
      getSalesByHour(),
      getSalesByMonth()
    ]);
    
    return { categorySales, hourlySales, monthlySales };
  } catch (error) {
    console.error('Error updating reports page:', error);
    return null;
  }
};
