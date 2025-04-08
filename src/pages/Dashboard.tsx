
import React from 'react';
import Layout from '@/components/layout/Layout';
import { DashboardCardsRealtime } from '@/components/dashboard/DashboardCardRealtime';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { useDashboardInit } from '@/hooks/use-dashboard-init';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const { error, isReady } = useDashboardInit();
  console.log('🔄 [Dashboard] Rendering dashboard with ready state:', isReady);
  
  // Si no está inicializado, esperar
  if (!isReady && !error) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
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
  
  if (error) {
    console.error('❌ [Dashboard] Error inicializando el dashboard:', error);
    return (
      <Layout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar el dashboard</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Dashboard</h1>
        </div>
        
        <DashboardCardsRealtime />

        <Tabs defaultValue="ventas" className="w-full">
          <TabsList className="w-full justify-start mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
            <TabsTrigger 
              value="ventas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Ventas
            </TabsTrigger>
            <TabsTrigger 
              value="pedidos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ventas" className="space-y-4 mt-2">
            <DashboardContent showOrders={false} />
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-4 mt-2">
            <DashboardContent showOrders={true} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
