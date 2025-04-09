
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/dashboard.types';

// Function to obtain detailed dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas detalladas del dashboard');
    
    // Get today's date boundaries for accurate calculations
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    console.log(`📊 [DashboardService] Período de cálculo: Hoy=${todayStart.toISOString()} a ${now.toISOString()}`);
    console.log(`📊 [DashboardService] Período de comparación: Ayer=${yesterdayStart.toISOString()} a ${yesterdayEnd.toISOString()}`);
    
    // Get active orders with status breakdown - CORRECT ACTIVE DEFINITION
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at, customer_name');
    
    if (ordersError) {
      console.error('❌ [DashboardService] Error en consulta de órdenes:', ordersError);
      throw ordersError;
    }
    
    // Log the query results for debugging
    console.log(`📊 [DashboardService] Órdenes totales recuperadas: ${ordersData?.length || 0}`);
    
    if (!ordersData || ordersData.length === 0) {
      console.log('⚠️ [DashboardService] No se encontraron órdenes en la base de datos');
      return getDefaultDashboardStats();
    }
    
    // Define status groups for consistent categorization
    const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
    const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
    const readyStatuses = ['ready', 'listo', 'lista'];
    const completedStatuses = ['completed', 'delivered', 'completado', 'entregado', 'paid'];
    const cancelledStatuses = ['cancelled', 'cancelado', 'cancelada'];
    
    // Count orders by status with consistent categorization
    const pendingOrders = ordersData.filter(order => pendingStatuses.includes(order.status)).length;
    const preparingOrders = ordersData.filter(order => preparingStatuses.includes(order.status)).length;
    const readyOrders = ordersData.filter(order => readyStatuses.includes(order.status)).length;
    const completedOrders = ordersData.filter(order => completedStatuses.includes(order.status)).length;
    const cancelledOrders = ordersData.filter(order => cancelledStatuses.includes(order.status)).length;
    
    // CORRECT: Active orders are ONLY pending and preparing (not ready)
    const activeOrders = pendingOrders + preparingOrders;
    
    console.log(`📊 [DashboardService] Pedidos por estado:
      - Pendientes: ${pendingOrders}
      - En preparación: ${preparingOrders}
      - Listos: ${readyOrders}
      - Completados: ${completedOrders}
      - Cancelados: ${cancelledOrders}
      - TOTAL ACTIVOS: ${activeOrders}`);
    
    // Get today's sales with accurate time filter and status filter (only completed/delivered/paid)
    const { data: todaySalesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total, status, created_at, customer_name')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', now.toISOString())
      .in('status', completedStatuses);
    
    if (salesError) {
      console.error('❌ [DashboardService] Error en consulta de ventas:', salesError);
      throw salesError;
    }
    
    console.log(`📊 [DashboardService] Ventas de hoy: ${todaySalesData?.length || 0} órdenes`);
    console.log('📊 [DashboardService] Datos de ventas:', todaySalesData);
    
    // Calculate sales totals
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    // Get yesterday's sales for accurate comparison
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total, status, customer_name')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .in('status', completedStatuses);
    
    if (yesterdayError) {
      console.error('❌ [DashboardService] Error en consulta de ventas de ayer:', yesterdayError);
      throw yesterdayError;
    }
    
    // Calculate yesterday totals for comparison
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    console.log(`📊 [DashboardService] Comparación ventas:
      - Hoy: ${dailyTotal.toFixed(2)}
      - Ayer: ${yesterdayTotal.toFixed(2)}
      - Cambio: ${changePercentage.toFixed(2)}%`);
    
    // Get unique customers today with accurate time filter
    // Count unique customer names only from completed/delivered orders
    const uniqueCustomers = new Set();
    todaySalesData?.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    const todayCustomerCount = uniqueCustomers.size;
    
    // Get unique customers yesterday for comparison
    const yesterdayUniqueCustomers = new Set();
    yesterdaySalesData?.forEach(order => {
      if (order.customer_name) {
        yesterdayUniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    const yesterdayCustomerCount = yesterdayUniqueCustomers.size;
    const customerChangePercentage = yesterdayCustomerCount > 0
      ? ((todayCustomerCount - yesterdayCustomerCount) / yesterdayCustomerCount) * 100
      : 0;
    
    console.log(`📊 [DashboardService] Clientes únicos:
      - Hoy: ${todayCustomerCount} (${Array.from(uniqueCustomers).join(', ')})
      - Ayer: ${yesterdayCustomerCount}
      - Cambio: ${customerChangePercentage.toFixed(2)}%`);
    
    // Get popular items (all time, not just 7 days) - MODIFIED TO ENSURE RESULTS
    // We'll query order_items directly with no time limit first to ensure we get some data
    const { data: orderItemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        name,
        menu_item_id,
        quantity,
        order_id,
        orders!inner(status)
      `)
      .in('orders.status', completedStatuses);
    
    if (itemsError) {
      console.error('❌ [DashboardService] Error en consulta de items populares:', itemsError);
      throw itemsError;
    }
    
    console.log(`📊 [DashboardService] Items de órdenes recuperados: ${orderItemsData?.length || 0}`);
    
    // Calculate item popularity with detailed logging
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
      .slice(0, 5) // Get top 5 items
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        id: item.id
      }));
    
    console.log(`📊 [DashboardService] Top 5 platos populares calculados:`, 
      popularItems.map(i => `${i.name}: ${i.quantity}`).join(', '));
    
    const lastUpdated = new Date().toISOString();
    
    return {
      salesStats: {
        dailyTotal,
        transactionCount,
        averageTicket,
        changePercentage,
        lastUpdated
      },
      ordersStats: {
        activeOrders,
        pendingOrders,
        inPreparationOrders: preparingOrders,
        readyOrders,
        lastUpdated
      },
      customersStats: {
        todayCount: todayCustomerCount,
        changePercentage: customerChangePercentage,
        lastUpdated
      },
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas:', error);
    return getDefaultDashboardStats();
  }
};

// Helper function to return default stats object when data can't be loaded
function getDefaultDashboardStats(): DashboardStats {
  return {
    salesStats: {
      dailyTotal: 0,
      transactionCount: 0,
      averageTicket: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString()
    },
    ordersStats: {
      activeOrders: 0,
      pendingOrders: 0,
      inPreparationOrders: 0,
      readyOrders: 0,
      lastUpdated: new Date().toISOString()
    },
    customersStats: {
      todayCount: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString()
    },
    popularItems: []
  };
}
