
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getDailySummary, updateDailySummary as updateSummaryService } from '@/services/cashier/summaryService';

interface DailySales {
  date: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  orderCount: number;
  averageTicket: number;
}

interface UpdateSummaryData {
  sales: number;
  orderCount: number;
  payments: Array<{
    method: string;
    amount: number;
  }>;
}

export const useDailySummary = () => {
  const [summary, setSummary] = useState<DailySales | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadDailySummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDailySummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading daily summary:', err);
      setError('No se pudo cargar el resumen diario');
      toast({
        title: 'Error',
        description: 'No se pudo cargar el resumen diario de ventas',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDailySummary = async (data: UpdateSummaryData) => {
    try {
      // Extract payment amounts by method
      const cashAmount = data.payments
        .filter(p => p.method === 'cash')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const cardAmount = data.payments
        .filter(p => p.method === 'card')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const transferAmount = data.payments
        .filter(p => p.method === 'transfer')
        .reduce((sum, p) => sum + p.amount, 0);

      // Update the summary in the service/database
      await updateSummaryService({
        date: new Date().toISOString().split('T')[0],
        totalSales: data.sales,
        cashSales: cashAmount,
        cardSales: cardAmount,
        transferSales: transferAmount,
        orderCount: data.orderCount
      });

      // Reload summary
      await loadDailySummary();
    } catch (err) {
      console.error('Error updating daily summary:', err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el resumen diario',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadDailySummary();
  }, []);

  return {
    summary,
    isLoading,
    error,
    loadDailySummary,
    updateDailySummary
  };
};
