
import React from 'react';
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
import { useDailySales } from '@/hooks/use-daily-sales';
import EnhancedDashboardCard from './EnhancedDashboardCard';
import EnhancedDashboardCardWrapper from './EnhancedDashboardCardWrapper';
import { DashboardCard } from '@/types/dashboard.types';

const SalesMetricCard: React.FC = () => {
  const { 
    salesTotal, 
    transactionCount, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshSales 
  } = useDailySales();
  
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
              onClick={refreshSales}
            >
              <RefreshCcw className="h-3 w-3" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Create dashboard card data with proper type definitions
  const dashboardCard: DashboardCard = {
    title: 'Ventas del Día',
    value: formatCurrency(salesTotal),
    icon: 'dollar-sign',
    color: 'green',
    // Using the correct properties from DashboardCard interface
    subtitle: `${transactionCount} transacciones`,
    changeValue: transactionCount,
    changeLabel: 'transacciones',
    trend: {
      value: 0,
      label: 'hoy',
      direction: transactionCount > 0 ? 'up' : 'down',
      icon: transactionCount > 0 ? 'arrow-up-right' : 'arrow-down-right'
    }
  };
  
  // Zero sales state with diagnostic information
  if (salesTotal === 0 && transactionCount === 0) {
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
                        <p>- Última actualización: {lastUpdated.toLocaleTimeString()}</p>
                        <p>- Revise la consola para más detalles</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex gap-2 items-center text-xs"
                  onClick={refreshSales}
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
  
  // Normal state with sales data - using EnhancedDashboardCardWrapper for type safety
  return (
    <div className="w-full md:w-[300px]">
      <EnhancedDashboardCardWrapper cardData={dashboardCard} />
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {transactionCount} transacciones
        </span>
        <Button 
          size="sm" 
          variant="ghost" 
          className="flex gap-2 items-center text-xs"
          onClick={refreshSales}
        >
          <RefreshCcw className="h-3 w-3" />
          Actualizar
        </Button>
      </div>
    </div>
  );
};

export default SalesMetricCard;
