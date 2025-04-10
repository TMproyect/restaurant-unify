
import { useState, useEffect, useCallback } from 'react';
import { getSalesStats } from '@/services/dashboardService/stats/salesStats';
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
      
      // Obtener estadísticas de ventas directamente
      const salesStats = await getSalesStats();
      console.log('✅ [useSalesMetric] Estadísticas obtenidas:', salesStats);
      
      // Guardar datos crudos para debugging
      setRawSalesData(salesStats);
      setLastUpdated(new Date());
      
      // Verificar si hay un error específico guardado en las estadísticas
      if (salesStats.error) {
        console.warn('⚠️ [useSalesMetric] Error reportado:', salesStats.error);
        setError(salesStats.error);
        
        // Notificar, pero no interrumpir el flujo
        toast.warning('Advertencia', {
          description: `Error en datos de ventas: ${salesStats.error}`,
        });
      }
      
      // Generar un objeto DashboardStats mínimo con solo los datos de ventas
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
      
      // Generar tarjetas a partir de las estadísticas mínimas
      const cards = generateDashboardCards(minimalStats);
      
      // Extraer solo la tarjeta de ventas y agregar info adicional
      const salesCardOnly = cards[0];
      console.log('✅ [useSalesMetric] Tarjeta de ventas generada:', salesCardOnly);
      
      // Agregar detalles de diagnóstico a la tarjeta si no hay ventas
      if (salesStats.dailyTotal === 0 && salesStats.transactionCount === 0) {
        salesCardOnly.description = "Sin ventas registradas hoy";
        salesCardOnly.tooltip = "Verifique estados de órdenes o revise la consola para más detalles";
      }
      
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
  
  // Obtener datos al montar
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
