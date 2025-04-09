
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { 
  getSalesByPeriod, 
  getDailySalesSummary, 
  getMostSoldProducts, 
  getRecentTransactions,
  subscribeToSalesUpdates,
  type SalesSummary,
  type TransactionData
} from '@/services/salesService';

export const useSalesData = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productSalesData, setProductSalesData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const { toast: uiToast } = useToast();

  // Reload data when date or period changes
  useEffect(() => {
    console.log('🔄 [useSalesData] Date or period changed:', { date, period });
    loadSalesData();
  }, [date, period]);

  // Setup realtime updates subscription
  useEffect(() => {
    console.log('🔄 [useSalesData] Setting up realtime subscription');
    const unsubscribe = subscribeToSalesUpdates(() => {
      // Refresh data when sales are updated
      console.log('🔵 [useSalesData] Realtime update received, refreshing data');
      loadSalesData();
      toast('Datos de ventas actualizados', {
        description: "Se han detectado nuevas transacciones"
      });
    });
    
    return () => {
      console.log('🔄 [useSalesData] Cleaning up realtime subscription');
      unsubscribe();
    };
  }, []);

  const loadSalesData = async () => {
    console.log('🔄 [useSalesData] Loading sales data...');
    setIsLoading(true);
    try {
      // Get selected date in string format
      const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
      console.log('🔵 [useSalesData] Using date:', dateStr);
      
      // Load daily summary
      const summary = await getDailySalesSummary(dateStr);
      console.log('✅ [useSalesData] Daily summary:', summary);
      setSalesSummary(summary);
      
      // Load sales by period
      const periodData = await getSalesByPeriod(period, 7);
      const formattedPeriodData = periodData.map(item => ({
        day: new Date(item.date).toLocaleDateString('es', { weekday: 'short' }),
        sales: item.total
      }));
      console.log('✅ [useSalesData] Period data:', formattedPeriodData);
      setSalesData(formattedPeriodData);
      
      // Load most sold products
      const products = await getMostSoldProducts(5, period === 'daily' ? 1 : period === 'weekly' ? 7 : 30);
      const formattedProducts = products.map(product => ({
        name: product.product_name,
        sales: product.quantity
      }));
      console.log('✅ [useSalesData] Product sales data:', formattedProducts);
      setProductSalesData(formattedProducts);
      
      // Load recent transactions
      const transactions = await getRecentTransactions(5);
      console.log('✅ [useSalesData] Recent transactions:', transactions);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('❌ [useSalesData] Error loading sales data:', error);
      toast('Error', {
        description: "No se pudieron cargar los datos de ventas"
      });
    } finally {
      console.log('🔄 [useSalesData] Finished loading sales data');
      setIsLoading(false);
    }
  };

  return {
    date,
    setDate,
    period,
    setPeriod,
    isLoading,
    salesSummary,
    salesData,
    productSalesData,
    recentTransactions,
    loadSalesData
  };
};
