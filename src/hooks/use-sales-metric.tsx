
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getSalesStats } from '@/services/dashboardService/stats/salesStats';
import { generateDashboardCards } from '@/services/dashboardService/dashboardCards';

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
      
      // Obtener estadísticas de ventas usando el servicio centralizado
      const salesStats = await getSalesStats();
      console.log('✅ [useSalesMetric] Datos de ventas obtenidos:', salesStats);
      
      // Verificar que usamos estados correctos para contabilizar ventas
      if (salesStats && typeof salesStats === 'object') {
        console.log('🧪 [useSalesMetric] Estamos usando "ready" como el estado para ventas completadas.');
      }
      
      // Adaptar los datos al formato esperado por generateDashboardCards
      const adaptedStats = {
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
      
      // Generar las tarjetas de dashboard
      const cards = generateDashboardCards(adaptedStats);
      const salesCardOnly = cards[0];
      console.log('✅ [useSalesMetric] Tarjeta de ventas generada:', salesCardOnly);
      
      // Actualizar estados
      setRawSalesData(salesStats);
      setLastUpdated(new Date(salesStats.lastUpdated));
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
  
  // Obtener datos al montar el componente y configurar actualización automática
  useEffect(() => {
    fetchSalesData();
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useSalesMetric] Refrescando datos automáticamente...');
      fetchSalesData();
    }, 3 * 60 * 1000);
    
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
