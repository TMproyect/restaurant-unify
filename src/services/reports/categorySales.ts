
import { supabase } from '@/integrations/supabase/client';
import { CategorySalesData } from './types';

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
      .in('orders.status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado']);
    
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
