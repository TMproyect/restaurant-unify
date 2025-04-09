import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, DashboardCardData } from '@/types/dashboard.types';

// Función para obtener estadísticas del dashboard de forma más detallada
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas detalladas del dashboard');
    
    // Get today's date boundaries
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    // Get active orders with status breakdown
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .in('status', ['pending', 'preparing', 'ready']);
    
    if (ordersError) throw ordersError;
    
    const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
    const preparingOrders = ordersData?.filter(order => order.status === 'preparing').length || 0;
    const readyOrders = ordersData?.filter(order => order.status === 'ready').length || 0;
    const activeOrders = pendingOrders + preparingOrders + readyOrders;
    
    // Get today's sales with transaction count
    const { data: todaySalesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total, status')
      .gte('created_at', todayStart.toISOString())
      .eq('status', 'completed');
    
    if (salesError) throw salesError;
    
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    // Get yesterday's sales for comparison
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString())
      .eq('status', 'completed');
    
    if (yesterdayError) throw yesterdayError;
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const changePercentage = yesterdayTotal > 0 
      ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
      : 0;
    
    // Get unique customers today
    const { data: customersData, error: customersError } = await supabase
      .from('orders')
      .select('customer_name')
      .gte('created_at', todayStart.toISOString())
      .eq('status', 'completed');
    
    if (customersError) throw customersError;
    
    // Count unique customers
    const uniqueCustomers = new Set();
    customersData?.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name.toLowerCase());
      }
    });
    
    // Get popular items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
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
      .eq('orders.status', 'completed');
    
    if (itemsError) throw itemsError;
    
    // Calculate item popularity
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
      .slice(0, 5);
    
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
        todayCount: uniqueCustomers.size,
        changePercentage: 0, // Would need previous day data for comparison
        lastUpdated
      },
      popularItems
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas:', error);
    throw error;
  }
};

// Generate dashboard cards based on stats
export const generateDashboardCards = (stats: DashboardStats): DashboardCardData[] => {
  return [
    {
      title: 'Ventas del Día',
      value: `$${stats.salesStats.dailyTotal.toFixed(2)}`,
      icon: 'dollar-sign',
      subvalue: `${stats.salesStats.transactionCount} transacciones • Ticket promedio: $${stats.salesStats.averageTicket.toFixed(2)}`,
      change: {
        value: `${stats.salesStats.changePercentage > 0 ? '+' : ''}${stats.salesStats.changePercentage.toFixed(1)}%`,
        isPositive: stats.salesStats.changePercentage >= 0,
        description: 'desde ayer'
      },
      tooltip: 'Total de ventas completadas hoy',
      lastUpdated: `Actualizado: ${new Date(stats.salesStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Pedidos Activos',
      value: `${stats.ordersStats.activeOrders}`,
      icon: 'clipboard-list',
      subvalue: `${stats.ordersStats.pendingOrders} pendientes • ${stats.ordersStats.inPreparationOrders} en preparación • ${stats.ordersStats.readyOrders} listos`,
      tooltip: 'Pedidos que no han sido entregados o completados',
      lastUpdated: `Actualizado: ${new Date(stats.ordersStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Clientes Hoy',
      value: `${stats.customersStats.todayCount}`,
      icon: 'users',
      tooltip: 'Basado en órdenes completadas hoy',
      change: {
        value: '+12%',  // Placeholder
        isPositive: true,
        description: 'desde la semana pasada'
      },
      lastUpdated: `Actualizado: ${new Date(stats.customersStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Platos Populares',
      value: 'Últimos 7 días',
      icon: 'package',
      items: stats.popularItems.map(item => ({
        name: item.name,
        value: `${item.quantity} vendidos`,
        link: `/menu?item=${item.id}`
      }))
    }
  ];
};

// Subscribe to dashboard updates using Supabase realtime
export const subscribeToDashboardUpdates = (callback: () => void) => {
  console.log('🔔 [DashboardService] Configurando suscripción en tiempo real mejorada');
  
  // Subscribe to orders table changes
  const channel = supabase
    .channel('dashboard-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' }, 
      () => {
        console.log('🔄 [DashboardService] Cambio detectado en órdenes');
        callback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      () => {
        console.log('🔄 [DashboardService] Cambio detectado en items de órdenes');
        callback();
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    console.log('🔕 [DashboardService] Cancelando suscripción');
    supabase.removeChannel(channel);
  };
};

// Get order activity with exception monitoring
export const getActivityMonitor = async (limit = 20) => {
  try {
    console.log('🔍 [DashboardService] Obteniendo monitor de actividad con detección de excepciones');
    
    // Get recent orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (ordersError) throw ordersError;
    
    // Set thresholds for exceptions
    const delayThresholdMinutes = 15; // Orders pending/preparing for more than X minutes
    const highDiscountThreshold = 15; // Discount percentage considered high
    
    // Process orders to detect exceptions
    const now = new Date();
    
    const activityItems = orders?.map(order => {
      // Calculate time elapsed
      const createdAt = new Date(order.created_at);
      const timeElapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      // Check for delays
      const isDelayed = (order.status === 'pending' || order.status === 'preparing') && 
                        timeElapsedMinutes > delayThresholdMinutes;
      
      // Check for discounts
      const hasDiscount = order.discount && order.discount > 0;
      const isHighDiscount = hasDiscount && order.discount >= highDiscountThreshold;
      
      // Determine actions based on status and exceptions
      const actions = [];
      
      // All orders have view details action
      actions.push({
        label: 'Ver Detalles',
        action: `view:${order.id}`,
        type: 'default'
      });
      
      // Add special actions for exceptions
      if (isDelayed) {
        actions.push({
          label: 'Priorizar',
          action: `prioritize:${order.id}`,
          type: 'warning'
        });
      }
      
      if (order.status === 'cancelled') {
        actions.push({
          label: 'Revisar Cancelación',
          action: `review-cancel:${order.id}`,
          type: 'danger'
        });
      }
      
      if (isHighDiscount) {
        actions.push({
          label: 'Ver Descuento',
          action: `review-discount:${order.id}`,
          type: 'warning'
        });
      }
      
      return {
        id: order.id,
        type: 'order' as const,
        status: order.status,
        customer: order.customer_name,
        total: order.total,
        timestamp: order.created_at,
        timeElapsed: timeElapsedMinutes,
        isDelayed,
        hasCancellation: order.status === 'cancelled',
        hasDiscount,
        discountPercentage: order.discount,
        itemsCount: order.items_count,
        actions
      };
    });
    
    return activityItems || [];
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener monitor de actividad:', error);
    return [];
  }
};

// Función para verificar el estado del sistema
export const checkSystemStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .eq('key', 'system_status');
    
    if (error) throw error;
    
    console.log('🔍 [DashboardService] Estado del sistema verificado:', data);
    
    return {
      status: data && data.length > 0 ? data[0].value : 'online',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al verificar estado del sistema:', error);
    return {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
