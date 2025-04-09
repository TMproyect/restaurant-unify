
import { supabase } from '@/integrations/supabase/client';

export const getPopularItems = async (days = 7, limit = 5) => {
  try {
    console.log(`📊 [DashboardService] Obteniendo items populares de los últimos ${days} días`);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();
    
    console.log(`📊 [DashboardService] Fecha de inicio para items populares: ${sevenDaysAgoStr}`);
    
    // Obtenemos todos los items de órdenes completadas o entregadas de los últimos días
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
      .gte('orders.created_at', sevenDaysAgoStr)
      .in('orders.status', ['completed', 'delivered', 'completado', 'entregado']);
    
    if (itemsError) {
      console.error('❌ [DashboardService] Error al obtener items populares:', itemsError);
      throw itemsError;
    }
    
    if (!orderItemsData || orderItemsData.length === 0) {
      console.log('⚠️ [DashboardService] No se encontraron items en órdenes completadas');
      return [];
    }
    
    console.log(`✅ [DashboardService] Se encontraron ${orderItemsData.length} items en órdenes completadas`);
    
    // Calcular popularidad de items
    const itemCountMap = new Map();
    orderItemsData.forEach(item => {
      const itemId = item.menu_item_id || item.name;
      const count = itemCountMap.get(itemId) || { name: item.name, quantity: 0, id: itemId };
      count.quantity += item.quantity;
      itemCountMap.set(itemId, count);
    });
    
    // Convertir a array y ordenar por cantidad
    const popularItems = Array.from(itemCountMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        id: item.id
      }));
    
    console.log('✅ [DashboardService] Items populares calculados:', popularItems);
    return popularItems;
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener items populares:', error);
    return []; // Devolver array vacío en caso de error para evitar fallos
  }
};
