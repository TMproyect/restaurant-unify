
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDailySales() {
  const [salesTotal, setSalesTotal] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Define ALL possible statuses that count as a completed sale
  const COMPLETED_SALE_STATUSES = [
    // Spanish variations
    'completado', 'completada', 'completo', 'completa',
    'terminado', 'terminada', 'terminó',
    'finalizado', 'finalizada', 'finalizó',
    'entregado', 'entregada', 'entregó',
    'pagado', 'pagada', 'pagó',
    'cobrado', 'cobrada', 'cobró',
    'listo', 'lista', 'preparado', 'preparada',
    'servido', 'servida',
    // English variations
    'completed', 'complete',
    'finished', 'done',
    'delivered', 'ready',
    'paid', 'processed',
    'served'
  ];

  const fetchDailySales = useCallback(async () => {
    console.log('🔍 [useDailySales] Fetching daily sales data...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      console.log(`📅 [useDailySales] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
      
      // Añadimos un pequeño retraso para asegurar que la conexión esté establecida
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Fetch ALL orders for today without filtering by status in the query
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
      
      if (error) {
        console.error('❌ [useDailySales] Error fetching orders:', error);
        throw error;
      }
      
      console.log(`📊 [useDailySales] Found ${orders?.length || 0} total orders for today`);
      
      // Filter completed sales and calculate totals
      let total = 0;
      let count = 0;
      
      // Display all found order statuses for debugging
      const allStatuses = [...new Set(orders?.map(order => order.status) || [])];
      console.log('📋 [useDailySales] All order statuses found today:', allStatuses);
      
      if (orders && orders.length > 0) {
        orders.forEach(order => {
          // Normalize status for comparison (lowercase, trim)
          const normalizedStatus = (order.status || '').toLowerCase().trim();
          
          // Check if this status is in our completed list
          const isCompleted = COMPLETED_SALE_STATUSES.some(status => 
            normalizedStatus === status.toLowerCase() || 
            normalizedStatus.includes(status.toLowerCase())
          );
          
          // Log each order evaluation
          console.log(`📝 [useDailySales] Order ${order.id}: status="${order.status}", isCompleted=${isCompleted}, total=${order.total}`);
          
          if (isCompleted) {
            // Parse total value safely
            let orderTotal = 0;
            if (typeof order.total === 'number') {
              orderTotal = order.total;
            } else if (order.total !== null && order.total !== undefined) {
              // Handle string or other formats by cleaning and parsing
              const cleaned = String(order.total).replace(/[^\d.-]/g, '');
              orderTotal = parseFloat(cleaned) || 0;
            }
            
            // Only add valid non-zero totals
            if (!isNaN(orderTotal) && orderTotal > 0) {
              total += orderTotal;
              count++;
              console.log(`💰 [useDailySales] Added to daily total: ${orderTotal}`);
            }
          }
        });
      }
      
      console.log(`💲 [useDailySales] Final daily total: $${total} from ${count} transactions`);
      
      // Update state with calculated values
      setSalesTotal(total);
      setTransactionCount(count);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ [useDailySales] Error calculating daily sales:', err);
      setError('Error al obtener datos de ventas');
      toast.error('Error al calcular ventas diarias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDailySales();
    
    // Set up auto-refresh interval (every 3 minutes)
    const interval = setInterval(() => {
      console.log('🔄 [useDailySales] Auto-refreshing sales data...');
      fetchDailySales();
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDailySales]);

  return {
    salesTotal,
    transactionCount,
    isLoading,
    error,
    lastUpdated,
    refreshSales: fetchDailySales
  };
}
