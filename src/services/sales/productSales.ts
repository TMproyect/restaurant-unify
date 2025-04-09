
import { supabase } from '@/integrations/supabase/client';
import { ProductSalesData } from './types';

// Get most sold products
export const getMostSoldProducts = async (limit: number = 5, periodDays: number = 7): Promise<ProductSalesData[]> => {
  try {
    console.log(`Fetching top ${limit} products for the last ${periodDays} days`);
    
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateStr = startDate.toISOString();
    
    // First get all order items from completed orders in the period
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id, 
        order_id, 
        menu_item_id, 
        name, 
        price, 
        quantity,
        orders!inner(status, updated_at)
      `)
      .gte('orders.updated_at', startDateStr)
      .lte('orders.updated_at', endDate)
      .in('orders.status', ['paid', 'completed', 'delivered', 'pagado', 'completado', 'entregado']);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return [];
    }

    // Log count of results for debugging
    console.log(`Found ${orderItems?.length || 0} order items in the period`);

    // Aggregate by product
    const productMap = new Map<string, { name: string, quantity: number, total: number }>();
    
    orderItems?.forEach(item => {
      const id = item.menu_item_id || item.name; // Fallback to name if no menu_item_id
      const existingProduct = productMap.get(id);
      
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
        existingProduct.total += (item.price * item.quantity);
      } else {
        productMap.set(id, {
          name: item.name,
          quantity: item.quantity,
          total: item.price * item.quantity
        });
      }
    });
    
    // Convert to array and sort by quantity
    const productList = [...productMap.entries()].map(([id, data]) => ({
      product_id: id,
      product_name: data.name,
      quantity: data.quantity,
      total: data.total
    }));
    
    return productList
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting most sold products:', error);
    return [];
  }
};
