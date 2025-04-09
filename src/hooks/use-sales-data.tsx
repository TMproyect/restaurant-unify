
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  // Reload data when date or period changes
  useEffect(() => {
    loadSalesData();
  }, [date, period]);

  // Setup realtime updates subscription
  useEffect(() => {
    const unsubscribe = subscribeToSalesUpdates(() => {
      // Refresh data when sales are updated
      loadSalesData();
      toast({
        title: "Datos actualizados",
        description: "Se han detectado nuevas ventas"
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      // Get selected date in string format
      const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
      
      // Load daily summary
      const summary = await getDailySalesSummary(dateStr);
      setSalesSummary(summary);
      
      // Load sales by period
      const periodData = await getSalesByPeriod(period, 7);
      const formattedPeriodData = periodData.map(item => ({
        day: new Date(item.date).toLocaleDateString('es', { weekday: 'short' }),
        sales: item.total
      }));
      setSalesData(formattedPeriodData);
      
      // Load most sold products
      const products = await getMostSoldProducts(5, period === 'daily' ? 1 : period === 'weekly' ? 7 : 30);
      const formattedProducts = products.map(product => ({
        name: product.product_name,
        sales: product.quantity
      }));
      setProductSalesData(formattedProducts);
      
      // Load recent transactions
      const transactions = await getRecentTransactions(5);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ventas",
        variant: "destructive"
      });
    } finally {
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
