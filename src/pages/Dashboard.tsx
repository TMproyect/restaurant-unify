
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardCardsRealtime } from '@/components/dashboard/DashboardCardRealtime';
import DashboardContent from '@/components/dashboard/DashboardContent';
import InventoryAlert from '@/components/dashboard/InventoryAlert';
import { useDashboardInit } from '@/hooks/use-dashboard-init';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { authState, isInitialized, isError, initialize, renderAttempt } = useDashboardInit();
  
  useEffect(() => {
    // Este efecto sólo es necesario porque estamos en desarrollo
    // y queremos asegurarnos de que el componente vuelva a renderizarse
    // después de que se resuelva el estado de autenticación
    console.log('🔄 [Dashboard] Emergency render effect activated');
    console.log('🔄 [Dashboard] Auth state:', authState);
    
    return () => {
      console.log('🔄 [Dashboard] Cleaning up initialization timers');
    };
  }, [authState]);
  
  // Si no está inicializado, esperar
  if (!isInitialized && !isError) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="h-10 bg-gray-200"></CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <DashboardCardsRealtime />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Tabs defaultValue="ventas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ventas">Ventas</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              </TabsList>

              <TabsContent value="ventas" className="space-y-4">
                <DashboardContent />
              </TabsContent>

              <TabsContent value="pedidos" className="space-y-4">
                <DashboardContent showOrders={true} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Alertas de Inventario</h2>
            <InventoryAlert />
          </div>
        </div>
      </div>
    </Layout>
  );
}
