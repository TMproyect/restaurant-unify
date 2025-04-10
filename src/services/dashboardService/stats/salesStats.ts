
import { supabase } from '@/integrations/supabase/client';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';

export const getSalesStats = async () => {
  try {
    console.log('📊 [SalesStats] INICIO: Calculando estadísticas de ventas');
    
    // Enfoque totalmente nuevo - Primero obtendremos todas las órdenes de hoy
    // y luego filtraremos localmente para máximo control
    
    // 1. Configurar fechas para "hoy" con precisión
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    console.log(`📊 [SalesStats] Fechas configuradas: Hoy=${todayStart.toISOString()} hasta ${tomorrowStart.toISOString()}`);
    
    // 2. Obtener TODAS las órdenes de hoy, sin filtro de estado inicial
    const { data: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString());
    
    if (ordersError) {
      console.error('❌ [SalesStats] Error obteniendo órdenes de hoy:', ordersError);
      throw ordersError;
    }
    
    console.log(`📊 [SalesStats] Órdenes encontradas hoy: ${todayOrders?.length || 0}`);
    console.log('📊 [SalesStats] Muestra de órdenes:', todayOrders?.slice(0, 3));
    
    // 3. Filtrar por estados completados LOCALMENTE para mayor control
    // Definimos los estados que indican que una orden está completada y debe contar como venta
    const completedStatuses = ['completed', 'completado', 'completada', 
                              'entregado', 'entregada', 'delivered',
                              'pagado', 'pagada', 'paid',
                              'listo', 'lista', 'ready',
                              'finalizado', 'finalizada', 'finished'];
    
    // Mostrar todos los estados presentes en las órdenes de hoy
    const allOrderStatuses = [...new Set(todayOrders?.map(order => order.status) || [])];
    console.log('📊 [SalesStats] Todos los estados presentes hoy:', allOrderStatuses);
    
    // Filtrar las órdenes completadas
    const completedOrders = todayOrders?.filter(order => {
      // Normalizar el estado para comparación
      const normalizedStatus = String(order.status || '').toLowerCase().trim();
      
      // Una orden cuenta como venta completa si su estado está en nuestra lista
      const isCompleted = completedStatuses.some(status => 
        normalizedStatus === status || normalizedStatus.includes(status)
      );
      
      console.log(`📊 [SalesStats] Orden ${order.id}: estado='${order.status}', ¿es venta?=${isCompleted}`);
      
      return isCompleted;
    }) || [];
    
    console.log(`📊 [SalesStats] Órdenes completadas filtradas: ${completedOrders.length}`);
    
    // 4. Calcular totales con verificación de tipos
    let dailyTotal = 0;
    completedOrders.forEach(order => {
      // Asegurar que total sea un número válido
      const orderTotal = typeof order.total === 'number' 
        ? order.total 
        : parseFloat(String(order.total).replace(/[^\d.-]/g, '')) || 0;
      
      console.log(`📊 [SalesStats] Sumando orden ${order.id}: $${orderTotal}`);
      dailyTotal += orderTotal;
    });
    
    const transactionCount = completedOrders.length;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    console.log(`📊 [SalesStats] Total calculado: $${dailyTotal}, Transacciones: ${transactionCount}`);
    
    // 5. Obtener datos de ayer para comparación usando el mismo enfoque
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
    
    console.log(`📊 [SalesStats] Fechas ayer: ${yesterdayStart.toISOString()} a ${yesterdayEnd.toISOString()}`);
    
    const { data: yesterdayOrders, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', yesterdayEnd.toISOString());
    
    if (yesterdayError) {
      console.error('❌ [SalesStats] Error obteniendo órdenes de ayer:', yesterdayError);
      throw yesterdayError;
    }
    
    // Filtrar órdenes completadas de ayer
    const completedYesterdayOrders = yesterdayOrders?.filter(order => {
      const normalizedStatus = String(order.status || '').toLowerCase().trim();
      return completedStatuses.some(status => 
        normalizedStatus === status || normalizedStatus.includes(status)
      );
    }) || [];
    
    console.log(`📊 [SalesStats] Órdenes completadas ayer: ${completedYesterdayOrders.length}`);
    
    // Calcular total de ayer
    let yesterdayTotal = 0;
    completedYesterdayOrders.forEach(order => {
      const orderTotal = typeof order.total === 'number' 
        ? order.total 
        : parseFloat(String(order.total).replace(/[^\d.-]/g, '')) || 0;
      
      yesterdayTotal += orderTotal;
    });
    
    // Calcular cambio porcentual con manejo especial para valores cero
    let changePercentage = 0;
    if (yesterdayTotal > 0) {
      changePercentage = ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100;
    } else if (dailyTotal > 0) {
      changePercentage = 100; // Si ayer fue 0 pero hoy hay ventas
    }
    
    console.log(`📊 [SalesStats] RESULTADO FINAL: $${dailyTotal} (${transactionCount} trans.) | Ayer: $${yesterdayTotal} | Cambio: ${changePercentage.toFixed(2)}%`);
    
    // 6. RETORNAR RESULTADOS
    return {
      dailyTotal,
      transactionCount,
      averageTicket,
      changePercentage,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [SalesStats] Error fatal en cálculo de estadísticas:', error);
    
    // Retornar valores predeterminados en lugar de lanzar error
    return {
      dailyTotal: 0,
      transactionCount: 0,
      averageTicket: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
