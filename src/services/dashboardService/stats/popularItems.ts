
import { supabase } from '@/integrations/supabase/client';

export const getPopularItems = async (days = 7, limit = 5) => {
  try {
    console.log(`📊 [DashboardService] Obteniendo items populares de los últimos ${days} días`);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
    
    // Include completed and delivered orders for better accuracy
    const { data: orderItemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        name,
        menu_item_id,
        quantity,
        order_id,
        orders!inner(status, created_at)
      `)
      .gte('orders.created_at', sevenDaysAgo.toISOString())
      .in('orders.status', ['completed', 'delivered']);
    
    if (itemsError) throw itemsError;
    
    // Calculate item popularity with improved aggregation
    const itemCountMap = new Map();
    orderItemsData?.forEach(item => {
      const itemId = item.menu_item_id || item.name;
      const count = itemCountMap.get(itemId) || { name: item.name, quantity: 0, id: itemId };
      count.quantity += item.quantity;
      itemCountMap.set(itemId, count);
    });
    
    // Convert to array and sort by quantity
    const popularItems = Array.from(itemCountMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        id: item.id
      }));
    
    console.log('✅ [DashboardService] Popular items loaded:', popularItems.length);
    return popularItems;
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener items populares:', error);
    throw error;
  }
};
