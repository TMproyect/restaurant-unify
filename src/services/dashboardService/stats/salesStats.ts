
import { supabase } from '@/integrations/supabase/client';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';

export const getSalesStats = async () => {
  try {
    console.log('📊 [SalesStats] Iniciando cálculo de estadísticas de ventas...');
    
    // Configuración de fechas
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    console.log(`📊 [SalesStats] Rango de hoy: ${todayStart.toISOString()} a ${new Date().toISOString()}`);
    console.log(`📊 [SalesStats] Rango de ayer: ${yesterdayStart.toISOString()} a ${yesterdayEnd.toISOString()}`);
    
    // VERIFICACIÓN DIRECTA: Obtener TODAS las órdenes de hoy para diagnóstico
    const { data: allTodayOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', todayStart.toISOString());
    
    if (allOrdersError) {
      console.error('❌ [SalesStats] Error obteniendo todas las órdenes:', allOrdersError);
      throw allOrdersError;
    }
    
    console.log(`📊 [SalesStats] Total de órdenes en el sistema hoy: ${allTodayOrders?.length || 0}`);
    
    // Lista amplia de estados que consideramos como "completados" o "pagados"
    const completedStatuses = [
      'completed', 'completado', 'complete', 'completo', 'completa', 'completada',
      'delivered', 'entregado', 'entregada', 'deliver', 'entrega',
      'paid', 'pagado', 'pagada', 'pago', 'pay',
      'listo', 'lista', 'ready', 'done',
      'finalizado', 'finalizada', 'finish',
      'closed', 'cerrado', 'cerrada'
    ];
    
    // Filtrar manualmente para mayor control y mostrar diagnóstico
    const todaySalesData = allTodayOrders?.filter(order => {
      // Normalizar el estado para comparación (minúsculas, sin espacios extras)
      const normalizedStatus = (order.status || '').toLowerCase().trim();
      
      // Verificar si el estado normalizado está en nuestra lista de estados completados
      const isCompleted = completedStatuses.some(status => 
        normalizedStatus === status || normalizedStatus.includes(status)
      );
      
      // Registrar cada orden y su estado para diagnóstico
      console.log(`📊 [SalesStats] Orden ID: ${order.id.substring(0, 6)}... | Estado: "${order.status}" | ¿Completada?: ${isCompleted ? 'SÍ' : 'NO'} | Total: ${order.total || 0}`);
      
      return isCompleted;
    });
    
    // Totales para hoy
    const dailyTotal = todaySalesData?.reduce((sum, order) => sum + (parseFloat(String(order.total)) || 0), 0) || 0;
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    console.log(`📊 [SalesStats] RESULTADO: Ventas de hoy: $${dailyTotal} | Transacciones: ${transactionCount}`);
    
    // Ventas de ayer (usando el mismo enfoque más preciso)
    const { data: allYesterdayOrders, error: allYesterdayError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', yesterdayStart.toISOString())
      .lte('created_at', yesterdayEnd.toISOString());
    
    if (allYesterdayError) {
      console.error('❌ [SalesStats] Error obteniendo órdenes de ayer:', allYesterdayError);
      throw allYesterdayError;
    }
    
    // Filtrar manualmente como hicimos con las órdenes de hoy
    const yesterdaySalesData = allYesterdayOrders?.filter(order => {
      const normalizedStatus = (order.status || '').toLowerCase().trim();
      return completedStatuses.some(status => 
        normalizedStatus === status || normalizedStatus.includes(status)
      );
    });
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => sum + (parseFloat(String(order.total)) || 0), 0) || 0;
    
    // Calcular cambio porcentual con manejo especial para valores cero
    let changePercentage = 0;
    if (yesterdayTotal > 0) {
      changePercentage = ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100;
    } else if (dailyTotal > 0) {
      changePercentage = 100; // Si ayer fue 0 pero hoy hay ventas, mostrar un 100% de incremento
    }
    
    console.log(`📊 [SalesStats] Ventas de ayer: $${yesterdayTotal} | Cambio: ${changePercentage.toFixed(2)}%`);
    
    return {
      dailyTotal,
      transactionCount,
      averageTicket,
      changePercentage,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [SalesStats] Error en cálculo de estadísticas:', error);
    
    // Retornar valores predeterminados en lugar de lanzar para que el dashboard siga renderizándose
    return {
      dailyTotal: 0,
      transactionCount: 0,
      averageTicket: 0,
      changePercentage: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};
