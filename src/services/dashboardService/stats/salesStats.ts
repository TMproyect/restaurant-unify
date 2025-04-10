import { supabase } from '@/integrations/supabase/client';

export const getSalesStats = async () => {
  try {
    console.log('📊 [SalesStats] INICIO: Calculando estadísticas de ventas');
    
    // 1. VERIFICACIÓN DE ESTADOS: Consultar todos los estados de órdenes existentes
    const { data: uniqueStatuses, error: statusError } = await supabase
      .from('orders')
      .select('status')
      .not('status', 'is', null);
    
    if (statusError) {
      console.error('❌ [SalesStats] Error obteniendo estados de órdenes:', statusError);
      throw statusError;
    }
    
    // Extraer estados únicos
    const allStatuses = [...new Set(uniqueStatuses.map(item => item.status))];
    console.log('��� [SalesStats] Calculando Ventas: TODOS los estados encontrados en BD =', allStatuses);
    
    // 2. DEFINIR ESTADOS QUE REPRESENTAN VENTAS COMPLETADAS
    // Definimos estados que indican una venta completada
    const completedSaleStatuses = [
      'completado', 'completada', 'completed', 
      'pagado', 'pagada', 'paid',
      'entregado', 'entregada', 'delivered',
      'listo', 'lista', 'ready',
      'finalizado', 'finalizada', 'finished',
      'cerrado', 'cerrada', 'closed'
    ];
    
    // Verificar qué estados de los existentes corresponden a ventas completadas
    const matchingStatuses = allStatuses.filter(status => {
      const normalizedStatus = status.toLowerCase().trim();
      return completedSaleStatuses.some(completedStatus => 
        normalizedStatus === completedStatus || 
        normalizedStatus.includes(completedStatus)
      );
    });
    
    console.log('📊 [SalesStats] Calculando Ventas: Estados considerados como venta =', matchingStatuses);
    
    if (matchingStatuses.length === 0) {
      console.warn('⚠️ [SalesStats] ALERTA: No se encontraron estados que coincidan con ventas completadas');
      console.log('📊 [SalesStats] Se utilizarán todos los estados que no sean cancelados o pendientes');
      // Si no hay coincidencias, excluimos solo los estados claramente no finalizados
      const nonCompletedStatuses = ['pendiente', 'pending', 'cancelado', 'cancelled', 'cancelada'];
      matchingStatuses.push(...allStatuses.filter(status => {
        const normalizedStatus = status.toLowerCase().trim();
        return !nonCompletedStatuses.some(nonCompleted => 
          normalizedStatus === nonCompleted || 
          normalizedStatus.includes(nonCompleted)
        );
      }));
      console.log('📊 [SalesStats] Estados finalmente considerados como venta =', matchingStatuses);
    }
    
    // 3. CONFIGURACIÓN DE FECHAS para "hoy"
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    console.log(`📊 [SalesStats] Calculando Ventas: Rango de fechas = ${todayStart.toISOString()} a ${tomorrowStart.toISOString()}`);
    
    // 4. CONSULTA DIRECTA con los estados verificados
    const query = supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString())
      .in('status', matchingStatuses);
    
    console.log('📊 [SalesStats] Calculando Ventas: Consulta enviada =', {
      tabla: 'orders',
      campos: 'id, total, status, created_at',
      rango_fechas: `>= ${todayStart.toISOString()} y < ${tomorrowStart.toISOString()}`,
      estados: matchingStatuses
    });
    
    const { data: todaySalesData, error: salesError } = await query;
    
    if (salesError) {
      console.error('❌ [SalesStats] Error obteniendo ventas de hoy:', salesError);
      throw salesError;
    }
    
    console.log('📊 [SalesStats] Calculando Ventas: Resultado crudo de Supabase =', todaySalesData);
    
    // 5. CÁLCULO DE TOTALES con verificación explícita
    const dailyTotal = todaySalesData?.reduce((sum, order) => {
      const orderTotal = parseFloat(String(order.total)) || 0;
      console.log(`📊 [SalesStats] Orden ID: ${order.id.substring(0, 6)}... | Estado: "${order.status}" | Total: ${orderTotal}`);
      return sum + orderTotal;
    }, 0) || 0;
    
    const transactionCount = todaySalesData?.length || 0;
    const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
    
    console.log('📊 [SalesStats] Calculando Ventas: Suma final =', dailyTotal, "Transacciones =", transactionCount);
    
    // 6. OBTENER DATOS DE AYER PARA COMPARACIÓN (mismo enfoque)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
    
    console.log(`📊 [SalesStats] Calculando comparación: Rango de ayer = ${yesterdayStart.toISOString()} a ${yesterdayEnd.toISOString()}`);
    
    const { data: yesterdaySalesData, error: yesterdayError } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', yesterdayEnd.toISOString())
      .in('status', matchingStatuses);
    
    if (yesterdayError) {
      console.error('❌ [SalesStats] Error obteniendo ventas de ayer:', yesterdayError);
      throw yesterdayError;
    }
    
    console.log('📊 [SalesStats] Resultado ventas de ayer:', yesterdaySalesData?.length || 0, 'órdenes');
    
    const yesterdayTotal = yesterdaySalesData?.reduce((sum, order) => {
      return sum + (parseFloat(String(order.total)) || 0);
    }, 0) || 0;
    
    // Calcular cambio porcentual con manejo especial para valores cero
    let changePercentage = 0;
    if (yesterdayTotal > 0) {
      changePercentage = ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100;
    } else if (dailyTotal > 0) {
      changePercentage = 100; // Si ayer fue 0 pero hoy hay ventas, mostrar un 100% de incremento
    }
    
    console.log(`📊 [SalesStats] RESULTADO FINAL: Ventas hoy: $${dailyTotal} (${transactionCount} trans.) | Ayer: $${yesterdayTotal} | Cambio: ${changePercentage.toFixed(2)}%`);
    
    // 7. RETORNAR RESULTADOS FINALES
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
