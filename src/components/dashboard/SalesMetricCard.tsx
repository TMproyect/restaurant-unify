
import React from 'react';
import { useEffect } from 'react';
import { useSalesMetric } from '@/hooks/use-sales-metric';
import EnhancedDashboardCard from './EnhancedDashboardCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const SalesMetricCard: React.FC = () => {
  const { salesCard, isLoading, error, refetchSalesData } = useSalesMetric();
  
  useEffect(() => {
    console.log('Rendered SalesMetricCard with data:', { salesCard, isLoading, error });
  }, [salesCard, isLoading, error]);
  
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
  
  if (!salesCard) {
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
  
  return (
    <div className="w-full md:w-[300px]">
      <EnhancedDashboardCard {...salesCard} />
      <div className="mt-2 flex justify-end">
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
