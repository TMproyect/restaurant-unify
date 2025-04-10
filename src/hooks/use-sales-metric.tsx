
import { useState, useEffect, useCallback } from 'react';
import { getSalesStats } from '@/services/dashboardService/stats/salesStats';
import { generateDashboardCards } from '@/services/dashboardService/dashboardCards';
import { toast } from 'sonner';

export function useSalesMetric() {
  const [salesCard, setSalesCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawSalesData, setRawSalesData] = useState<any>(null);
  
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
  
  // Obtener datos al montar
  useEffect(() => {
    fetchSalesData();
    
    // Configurar un intervalo para refrescar los datos cada 5 minutos
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useSalesMetric] Refrescando datos automáticamente...');
      fetchSalesData();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(refreshInterval);
  }, [fetchSalesData]);
  
  return {
    salesCard,
    rawSalesData,
    isLoading,
    error,
    refetchSalesData: fetchSalesData
  };
}
