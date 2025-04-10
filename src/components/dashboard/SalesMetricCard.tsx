
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Info, AlertTriangle, Database, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import EnhancedDashboardCard from './EnhancedDashboardCard';
import { toast } from 'sonner';

// Status list that indicates a completed sale, including all variants and language versions
const COMPLETED_STATUSES = [
  'completado', 'completada', 'complete', 'completed',
  'terminado', 'terminada', 'finished',
  'finalizado', 'finalizada', 
  'entregado', 'entregada', 'delivered',
  'pagado', 'pagada', 'paid',
  'listo', 'lista', 'ready',
  'done', 'servido', 'servida', 'served'
];

const SalesMetricCard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [dashboardCard, setDashboardCard] = useState<any>(null);
  
  const fetchSalesData = async () => {
    try {
      console.log('🔄 [SalesMetricCard] Starting to fetch sales data...');
      setIsLoading(true);
      setError(null);
      
      // Set up today's date boundaries
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      console.log(`📊 [SalesMetricCard] Fetching orders between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`);
      
      // Get all orders for today
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total, created_at, customer_name')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());
      
      if (ordersError) {
        console.error('❌ [SalesMetricCard] Error fetching orders:', ordersError);
        throw ordersError;
      }
      
      // Log all found orders
      console.log(`📊 [SalesMetricCard] Found ${allOrders?.length || 0} total orders for today`);
      allOrders?.slice(0, 3).forEach(order => {
        console.log(`📊 [SalesMetricCard] Sample order: id=${order.id}, status=${order.status}, total=${order.total}`);
      });
      
      // Log all statuses found to aid in debugging
      const allStatuses = [...new Set(allOrders?.map(order => order.status) || [])];
      console.log('📊 [SalesMetricCard] All statuses found today:', allStatuses);
      
      // Filter for completed sales
      const completedOrders = allOrders?.filter(order => {
        const status = String(order.status || '').toLowerCase().trim();
        
        // Check if this order's status matches any in our completed list
        const isCompleted = COMPLETED_STATUSES.some(s => 
          status === s.toLowerCase() || status.includes(s.toLowerCase())
        );
        
        console.log(`📊 [SalesMetricCard] Order ${order.id}: status="${order.status}", isCompleted=${isCompleted}, total=${order.total}`);
        
        return isCompleted;
      }) || [];
      
      console.log(`📊 [SalesMetricCard] Identified ${completedOrders.length} completed sales out of ${allOrders?.length || 0} total orders`);
      
      // Calculate sales totals
      let dailyTotal = 0;
      let validTransactions = 0;
      
      completedOrders.forEach(order => {
        let orderTotal = 0;
        
        // Safely handle different total formats
        if (typeof order.total === 'number') {
          orderTotal = order.total;
        } else if (order.total !== null && order.total !== undefined) {
          // Clean the total string and parse it
          const cleaned = String(order.total).replace(/[^\d.-]/g, '');
          orderTotal = parseFloat(cleaned) || 0;
        }
        
        if (!isNaN(orderTotal) && orderTotal > 0) {
          console.log(`📊 [SalesMetricCard] Adding to sales: Order=${order.id}, Total=$${orderTotal}`);
          dailyTotal += orderTotal;
          validTransactions++;
        } else {
          console.log(`📊 [SalesMetricCard] Skipping invalid total: Order=${order.id}, Total=${order.total}`);
        }
      });
      
      console.log(`📊 [SalesMetricCard] FINAL RESULT: Daily sales=$${dailyTotal}, Transactions=${validTransactions}`);
      
      // Store sales data
      const ventas = {
        dailyTotal,
        transactionCount: validTransactions,
        lastUpdated: new Date().toISOString()
      };
      setSalesData(ventas);
      
      // Create dashboard card data
      const card = {
        title: 'Ventas del Día',
        value: formatCurrency(dailyTotal),
        icon: 'dollar-sign',
        change: {
          value: validTransactions,
          label: `${validTransactions} transacciones`
        },
        trend: validTransactions > 0 ? 'up' : 'neutral'
      };
      setDashboardCard(card);
      
    } catch (err) {
      console.error('❌ [SalesMetricCard] Error:', err);
      setError('Error al obtener datos de ventas');
      toast.error('Error al cargar datos de ventas');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchSalesData();
    
    // Refresh every 3 minutes
    const interval = setInterval(() => {
      console.log('🔄 [SalesMetricCard] Auto-refreshing sales data...');
      fetchSalesData();
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full md:w-[300px]">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full mt-4" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Card className="w-full md:w-[300px] border-red-200">
        <CardContent className="p-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-red-700">Error al cargar ventas</h3>
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 flex gap-2 items-center"
              onClick={() => fetchSalesData()}
            >
              <RefreshCcw className="h-3 w-3" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show empty state
  if (!salesData) {
    return (
      <Card className="w-full md:w-[300px]">
        <CardContent className="p-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Ventas del Día</h3>
            <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 flex gap-2 items-center"
              onClick={() => fetchSalesData()}
            >
              <RefreshCcw className="h-3 w-3" />
              Cargar datos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Zero sales state with diagnostic information
  if (salesData.dailyTotal === 0 && salesData.transactionCount === 0) {
    return (
      <Card className="w-full md:w-[300px] border border-yellow-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Ventas del Día</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-xs">
                    No se encontraron ventas completadas hoy. Verifique que las órdenes tengan estados como:
                    "completado", "pagado", "entregado", "listo" o similares.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-bold">{formatCurrency(0)}</p>
            <p className="text-sm text-muted-foreground">0 transacciones</p>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-500">
                        <Info className="h-3 w-3 mr-1" />
                        Ver diagnóstico
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <div className="text-xs space-y-1">
                        <p>- Fecha: {new Date().toLocaleDateString()}</p>
                        <p>- Última actualización: {new Date(salesData.lastUpdated).toLocaleTimeString()}</p>
                        <p>- Revise la consola para más detalles</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex gap-2 items-center text-xs"
                  onClick={() => fetchSalesData()}
                >
                  <RefreshCcw className="h-3 w-3" />
                  Actualizar
                </Button>
              </div>
              
              <div className="mt-2 flex items-center gap-1">
                <Database className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  Pruebe en <a href="/sales-test" className="text-blue-500 hover:underline flex items-center gap-0.5">
                    /sales-test
                    <ArrowUpRight className="h-2 w-2" />
                  </a>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Normal state with sales data
  return dashboardCard ? (
    <div className="w-full md:w-[300px]">
      <EnhancedDashboardCard {...dashboardCard} />
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {salesData.transactionCount} transacciones
        </span>
        <Button 
          size="sm" 
          variant="ghost" 
          className="flex gap-2 items-center text-xs"
          onClick={() => fetchSalesData()}
        >
          <RefreshCcw className="h-3 w-3" />
          Actualizar
        </Button>
      </div>
    </div>
  ) : (
    <Card className="w-full md:w-[300px]">
      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">Ventas del Día</h3>
          <p className="text-2xl font-bold">{formatCurrency(salesData.dailyTotal)}</p>
          <p className="text-sm text-muted-foreground">{salesData.transactionCount} transacciones</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2 flex gap-2 items-center"
            onClick={() => fetchSalesData()}
          >
            <RefreshCcw className="h-3 w-3" />
            Actualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesMetricCard;
