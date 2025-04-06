
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TablesList } from '@/components/tables/TablesList';
import { TableZones } from '@/components/tables/TableZones';
import { TableMap } from '@/components/tables/TableMap';
import { 
  getRestaurantTables, 
  getTableZones, 
  subscribeToTableChanges, 
  subscribeToZoneChanges 
} from '@/services/tableService';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import OrderPrintController from '@/components/OrderPrintController';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import DashboardError from '@/components/dashboard/DashboardError';
import DashboardLoading from '@/components/dashboard/DashboardLoading';

const Tables: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  
  const { 
    data: tables, 
    isLoading: tablesLoading, 
    error: tablesError,
    refetch: refetchTables
  } = useQuery({
    queryKey: ['restaurant-tables'],
    queryFn: getRestaurantTables,
  });

  const { 
    data: zones, 
    isLoading: zonesLoading, 
    error: zonesError,
    refetch: refetchZones
  } = useQuery({
    queryKey: ['table-zones'],
    queryFn: getTableZones,
  });

  useEffect(() => {
    if (tablesError) {
      toast.error('Error al cargar las mesas: ' + (tablesError as Error).message);
    }
    
    if (zonesError) {
      toast.error('Error al cargar las zonas: ' + (zonesError as Error).message);
    }
  }, [tablesError, zonesError]);

  // Suscripciones a cambios en tiempo real
  useEffect(() => {
    const unsubscribeTables = subscribeToTableChanges((updatedTables) => {
      // Actualizar la caché de react-query en lugar de usar setState directamente
      // Esto mantiene el estado sincronizado con otros componentes
      refetchTables();
    });

    const unsubscribeZones = subscribeToZoneChanges((updatedZones) => {
      refetchZones();
    });

    return () => {
      unsubscribeTables();
      unsubscribeZones();
    };
  }, [refetchTables, refetchZones]);

  const handleRefresh = () => {
    refetchTables();
    refetchZones();
    toast.success('Datos actualizados');
  };
  
  // Show error state if there's an error with tables or zones
  if (tablesError || zonesError) {
    const errorMessage = tablesError 
      ? `Error al cargar las mesas: ${(tablesError as Error).message}` 
      : `Error al cargar las zonas: ${(zonesError as Error).message}`;
    
    return (
      <Layout>
        <DashboardError error={errorMessage} />
      </Layout>
    );
  }

  // Show loading state when loading tables or zones
  if (tablesLoading || zonesLoading) {
    return (
      <Layout>
        <DashboardLoading />
      </Layout>
    );
  }

  return (
    <Layout>
      <OrderPrintController>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
            <div className="flex items-center space-x-3">
              <PrinterStatus compact />
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="lista">Lista de Mesas</TabsTrigger>
              <TabsTrigger value="zonas">Zonas</TabsTrigger>
              <TabsTrigger value="mapa">Mapa de Mesas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lista">
              <TablesList 
                tables={tables || []} 
                isLoading={tablesLoading} 
                zones={zones || []}
                onRefresh={refetchTables}
              />
            </TabsContent>
            
            <TabsContent value="zonas">
              <TableZones 
                zones={zones || []} 
                isLoading={zonesLoading}
                onRefresh={refetchZones}
              />
            </TabsContent>
            
            <TabsContent value="mapa">
              <TableMap 
                tables={tables || []} 
                zones={zones || []} 
                isLoading={tablesLoading || zonesLoading}
                onTableUpdate={refetchTables}
              />
            </TabsContent>
          </Tabs>
        </div>
      </OrderPrintController>
    </Layout>
  );
};

export default Tables;
