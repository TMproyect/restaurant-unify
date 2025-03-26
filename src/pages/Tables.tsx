
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TablesList } from '@/components/tables/TablesList';
import { TableZones } from '@/components/tables/TableZones';
import { TableMap } from '@/components/tables/TableMap';
import { getRestaurantTables, getTableZones } from '@/services/tableService';

const Tables: React.FC = () => {
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

  const handleRefresh = () => {
    refetchTables();
    refetchZones();
    toast.success('Datos actualizados');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
          <button 
            onClick={handleRefresh}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
          >
            Actualizar
          </button>
        </div>

        <Tabs defaultValue="lista" className="w-full">
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
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tables;
