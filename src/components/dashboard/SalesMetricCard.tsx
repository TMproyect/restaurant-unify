
import React from 'react';
import { useSalesMetric } from '@/hooks/use-sales-metric';
import EnhancedDashboardCard from './EnhancedDashboardCard';
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

const SalesMetricCard: React.FC = () => {
  const { salesCard, rawSalesData, isLoading, error, refetchSalesData } = useSalesMetric();
  
  React.useEffect(() => {
    console.log('📊 [SalesMetricCard] Renderizado con datos:', { 
      salesCard, 
      rawSalesData,
      isLoading, 
      error,
      cardValue: salesCard?.value || 'N/A',
      dailyTotal: rawSalesData?.dailyTotal || 0,
      transactions: rawSalesData?.transactionCount || 0
    });
  }, [salesCard, rawSalesData, isLoading, error]);
  
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
              onClick={() => refetchSalesData()}
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
  if (!salesCard || !rawSalesData) {
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
              onClick={() => refetchSalesData()}
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
  if (rawSalesData.dailyTotal === 0 && rawSalesData.transactionCount === 0) {
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
                    No se encontraron ventas completas hoy. Verifique que las órdenes tengan estados como:
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
                        <p>- Última actualización: {new Date(rawSalesData.lastUpdated).toLocaleTimeString()}</p>
                        {rawSalesData.error && <p className="text-red-500">- Error: {rawSalesData.error}</p>}
                        <p>- Revise la consola para más detalles</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex gap-2 items-center text-xs"
                  onClick={() => refetchSalesData()}
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
  return (
    <div className="w-full md:w-[300px]">
      <EnhancedDashboardCard {...salesCard} />
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {rawSalesData.transactionCount} transacciones
        </span>
        <Button 
          size="sm" 
          variant="ghost" 
          className="flex gap-2 items-center text-xs"
          onClick={() => refetchSalesData()}
        >
          <RefreshCcw className="h-3 w-3" />
          Actualizar
        </Button>
      </div>
    </div>
  );
};

export default SalesMetricCard;
