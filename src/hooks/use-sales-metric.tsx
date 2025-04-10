
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateDashboardCards } from '@/services/dashboardService/dashboardCards';
import { toast } from 'sonner';

export function useSalesMetric() {
  const [salesCard, setSalesCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawSalesData, setRawSalesData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const fetchSalesData = useCallback(async () => {
    try {
      console.log('🔄 [useSalesMetric] Iniciando obtención de datos de ventas...');
      setIsLoading(true);
      setError(null);
      
      // 1. Configurar fechas para "hoy"
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      
      console.log(`📊 [useSalesMetric] Fechas: Hoy=${todayStart.toISOString()} hasta ${tomorrowStart.toISOString()}`);
      
      // 2. CONSULTA DIRECTA: Obtener TODAS las órdenes de hoy sin filtrar por estado inicialmente
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', tomorrowStart.toISOString());
      
      if (ordersError) {
        console.error('❌ [useSalesMetric] Error obteniendo órdenes de hoy:', ordersError);
        throw ordersError;
      }
      
      console.log(`📊 [useSalesMetric] Órdenes encontradas hoy: ${allOrders?.length || 0}`);
      if (allOrders?.length) {
        console.log('📊 [useSalesMetric] Primeras 3 órdenes de ejemplo:', 
          allOrders.slice(0, 3).map(o => ({ id: o.id, status: o.status, total: o.total }))
        );
      }
      
      // 3. IMPORTANTE: Mostrar TODOS los estados presentes para diagnóstico
      const allStatuses = [...new Set(allOrders?.map(order => order.status) || [])];
      console.log('📊 [useSalesMetric] TODOS los estados encontrados hoy:', allStatuses);
      
      // 4. Lista EXTENDIDA y EXPLÍCITA de estados que indican ventas completadas
      // Incluimos todas las variaciones posibles para cubrir cualquier configuración
      const completedStatuses = [
        // Estados en español
        'completado', 'completada', 
        'terminado', 'terminada',
        'finalizado', 'finalizada',
        'entregado', 'entregada',
        'pagado', 'pagada',
        'cobrado', 'cobrada',
        'listo', 'lista',
        'servido', 'servida',
        // Estados en inglés
        'completed', 'complete',
        'finished',
        'delivered',
        'paid',
        'ready',
        'served',
        'done',
        // Con mayúsculas o variantes
        'Completado', 'COMPLETADO',
        'Listo', 'LISTO',
        'Pagado', 'PAGADO',
        'Entregado', 'ENTREGADO'
      ];
      
      console.log('📊 [useSalesMetric] Estados que cuentan como venta:', completedStatuses);
      
      // 5. Filtrar las órdenes que representan ventas (completadas/pagadas)
      const salesOrders = allOrders?.filter(order => {
        // Normalizar el estado para comparación
        const status = String(order.status || '').toLowerCase().trim();
        
        // Verificar si el estado está en nuestra lista de estados completados
        const isSale = completedStatuses.some(completeStatus => 
          status === completeStatus.toLowerCase() || 
          status.includes(completeStatus.toLowerCase())
        );
        
        // Importante: Loguear cada orden y su evaluación para diagnóstico
        console.log(`📊 [useSalesMetric] Orden ${order.id}: status="${order.status}", ¿es venta?=${isSale}, total=${order.total}`);
        
        return isSale;
      }) || [];
      
      console.log(`📊 [useSalesMetric] Órdenes filtradas como ventas: ${salesOrders.length}/${allOrders?.length || 0}`);
      
      // 6. Calcular los totales con verificación estricta de tipos
      let dailyTotal = 0;
      let validTransactions = 0;
      
      salesOrders.forEach(order => {
        let orderTotal = 0;
        
        // Verificar y convertir el total a número válido
        if (typeof order.total === 'number') {
          orderTotal = order.total;
        } else if (order.total !== null && order.total !== undefined) {
          // Intentar parsear string a número, limpiando caracteres no numéricos excepto punto decimal
          const cleaned = String(order.total).replace(/[^\d.-]/g, '');
          orderTotal = parseFloat(cleaned) || 0;
        }
        
        // Solo sumar si es un número válido mayor que cero
        if (!isNaN(orderTotal) && orderTotal > 0) {
          console.log(`📊 [useSalesMetric] Sumando venta: Orden ${order.id}, Total: $${orderTotal}`);
          dailyTotal += orderTotal;
          validTransactions++;
        } else {
          console.warn(`⚠️ [useSalesMetric] Orden con total inválido: ${order.id}, valor: ${order.total}`);
        }
      });
      
      console.log(`📊 [useSalesMetric] RESULTADO FINAL: Total ventas=$${dailyTotal}, Transacciones=${validTransactions}`);
      
      // 7. Preparar el objeto de datos para el KPI
      const salesStats = {
        dailyTotal,
        transactionCount: validTransactions,
        averageTicket: validTransactions > 0 ? dailyTotal / validTransactions : 0,
        changePercentage: 0, // No calculamos el cambio porcentual por simplicidad
        lastUpdated: new Date().toISOString()
      };
      
      // Guardar datos crudos para componente de diagnóstico
      setRawSalesData(salesStats);
      setLastUpdated(new Date());
      
      // Generar un objeto stats mínimo con solo los datos de ventas
      const minimalStats = {
        salesStats,
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
      
      // Generar tarjetas de dashboard
      const cards = generateDashboardCards(minimalStats);
      
      // Extraer solo la tarjeta de ventas
      const salesCardOnly = cards[0];
      console.log('✅ [useSalesMetric] Tarjeta de ventas generada:', salesCardOnly);
      
      setSalesCard(salesCardOnly);
      return salesCardOnly;
    } catch (err) {
      console.error('❌ [useSalesMetric] Error obteniendo datos de ventas:', err);
      setError('Error al cargar los datos de ventas');
      toast.error('Error', {
        description: 'No se pudieron cargar los datos de ventas',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Obtener datos al montar el componente
  useEffect(() => {
    fetchSalesData();
    
    // Configurar un intervalo para refrescar los datos cada 3 minutos
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useSalesMetric] Refrescando datos automáticamente...');
      fetchSalesData();
    }, 3 * 60 * 1000); // 3 minutos
    
    return () => clearInterval(refreshInterval);
  }, [fetchSalesData]);
  
  return {
    salesCard,
    rawSalesData,
    lastUpdated,
    isLoading,
    error,
    refetchSalesData: fetchSalesData
  };
}
