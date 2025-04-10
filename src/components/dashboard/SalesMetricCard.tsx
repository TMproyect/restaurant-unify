
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

const SalesMetricCard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [dashboardCard, setDashboardCard] = useState<any>(null);
  
  const fetchSalesData = async () => {
    try {
      console.log('🔄 [SalesMetricCard] Iniciando obtención de datos de ventas...');
      setIsLoading(true);
      setError(null);
      
      // Configurar fechas para "hoy"
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      console.log(`📊 [SalesMetricCard] Consultando ventas: Hoy=${todayStart.toISOString()} hasta ${todayEnd.toISOString()}`);
      
      // Obtener TODAS las órdenes de hoy
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());
      
      if (ordersError) {
        console.error('❌ [SalesMetricCard] Error obteniendo órdenes:', ordersError);
        throw ordersError;
      }
      
      console.log(`📊 [SalesMetricCard] Total órdenes encontradas: ${allOrders?.length || 0}`);
      
      // Lista de estados que indican una venta completada
      const completedStatuses = [
        'completado', 'completada', 'terminado', 'terminada',
        'finalizado', 'finalizada', 'entregado', 'entregada',
        'pagado', 'pagada', 'cobrado', 'cobrada',
        'listo', 'lista', 'servido', 'servida',
        'completed', 'complete', 'finished', 'delivered',
        'paid', 'ready', 'served', 'done',
        'Completado', 'COMPLETADO', 'Listo', 'LISTO',
        'Pagado', 'PAGADO', 'Entregado', 'ENTREGADO'
      ];
      
      // Mostrar todos los estados presentes en las órdenes
      const allStatuses = [...new Set(allOrders?.map(order => order.status) || [])];
      console.log('📊 [SalesMetricCard] Estados presentes:', allStatuses);
      
      // Filtrar las órdenes completadas
      const completedOrders = allOrders?.filter(order => {
        const status = String(order.status || '').toLowerCase().trim();
        const isCompleted = completedStatuses.some(s => 
          status === s.toLowerCase() || status.includes(s.toLowerCase())
        );
        console.log(`📊 [SalesMetricCard] Orden ${order.id}: status="${order.status}", ¿es venta?=${isCompleted}, total=${order.total}`);
        return isCompleted;
      }) || [];
      
      console.log(`📊 [SalesMetricCard] Órdenes completadas: ${completedOrders.length}/${allOrders?.length || 0}`);
      
      // Calcular totales
      let dailyTotal = 0;
      let validTransactions = 0;
      
      completedOrders.forEach(order => {
        let orderTotal = 0;
        
        if (typeof order.total === 'number') {
          orderTotal = order.total;
        } else if (order.total !== null && order.total !== undefined) {
          const cleaned = String(order.total).replace(/[^\d.-]/g, '');
          orderTotal = parseFloat(cleaned) || 0;
        }
        
        if (!isNaN(orderTotal) && orderTotal > 0) {
          console.log(`📊 [SalesMetricCard] Sumando venta: Orden ${order.id}, Total: $${orderTotal}`);
          dailyTotal += orderTotal;
          validTransactions++;
        }
      });
      
      console.log(`📊 [SalesMetricCard] RESULTADO FINAL: Total ventas=$${dailyTotal}, Transacciones=${validTransactions}`);
      
      // Guardar datos de ventas
      const ventas = {
        dailyTotal,
        transactionCount: validTransactions,
        lastUpdated: new Date().toISOString()
      };
      setSalesData(ventas);
      
      // Generar tarjeta para el dashboard
      const card = {
        title: 'Ventas del Día',
        value: formatCurrency(dailyTotal),
        icon: 'dollar-sign',
        change: {
          value: validTransactions,
          label: `${validTransactions} transacciones`
        },
        trend: 'up'
      };
      setDashboardCard(card);
      
    } catch (err) {
      console.error('❌ [SalesMetricCard] Error:', err);
      setError('Error al obtener datos de ventas');
      toast.error('Error al cargar datos de ventas');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar datos al montar componente
  useEffect(() => {
    fetchSalesData();
    
    // Actualizar cada 3 minutos
    const interval = setInterval(() => {
      console.log('🔄 [SalesMetricCard] Actualizando automáticamente...');
      fetchSalesData();
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Si está cargando, mostrar skeleton
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
  
  // Si hay error, mostrar mensaje de error
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
  
  // Si no hay datos pero no hay error, mostrar estado alternativo
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
  
  // Caso donde tenemos ventas en 0 (mostrar información de diagnóstico)
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
  
  // Caso normal: mostrar tarjeta de ventas con datos
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
