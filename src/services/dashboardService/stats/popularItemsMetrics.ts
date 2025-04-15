
import { supabase } from '@/integrations/supabase/client';

export const getPopularItemsMetrics = async () => {
  console.log('📊 [PopularItems] Calculando items populares');
  
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select(`
      id,
      name,
      menu_item_id,
      quantity,
      order_id,
      orders!inner(status)
    `)
    .eq('orders.status', 'ready')
    .limit(100);

  if (error) {
    console.error('❌ [PopularItems] Error obteniendo items:', error);
    throw error;
  }

  // Calculate item popularity
  const itemCountMap = new Map();
  orderItems?.forEach(item => {
    const itemId = item.menu_item_id || item.name;
    const count = itemCountMap.get(itemId) || { name: item.name, quantity: 0, id: itemId };
    count.quantity += item.quantity;
    itemCountMap.set(itemId, count);
  });

  // Convert to array and get top 5
  return Array.from(itemCountMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      quantity: item.quantity,
      id: item.id
    }));
};
