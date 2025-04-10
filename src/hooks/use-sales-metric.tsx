
import { useState, useEffect, useCallback } from 'react';
import { getSalesStats } from '@/services/dashboardService/stats/salesStats';
import { generateDashboardCards } from '@/services/dashboardService/dashboardCards';
import { toast } from 'sonner';

export function useSalesMetric() {
  const [salesCard, setSalesCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSalesData = useCallback(async () => {
    try {
      console.log('🔄 [useSalesMetric] Fetching sales data...');
      setIsLoading(true);
      setError(null);
      
      // Get sales stats directly
      const salesStats = await getSalesStats();
      
      console.log('✅ [useSalesMetric] Sales stats fetched:', salesStats);
      
      // Generate a minimal DashboardStats object with just the sales data
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
      
      // Generate cards from the minimal stats
      const cards = generateDashboardCards(minimalStats);
      
      // Extract just the sales card
      const salesCardOnly = cards[0];
      console.log('✅ [useSalesMetric] Sales card generated:', salesCardOnly);
      
      setSalesCard(salesCardOnly);
      return salesCardOnly;
    } catch (err) {
      console.error('❌ [useSalesMetric] Error fetching sales data:', err);
      setError('Error al cargar los datos de ventas');
      toast('Error', {
        description: 'No se pudieron cargar los datos de ventas',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch data on mount
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);
  
  return {
    salesCard,
    isLoading,
    error,
    refetchSalesData: fetchSalesData
  };
}
