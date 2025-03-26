
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';
import OrdersList, { OrderStatus } from '@/components/dashboard/OrdersList';
import NewOrderModal from '@/components/order/NewOrderModal';
import { useToast } from '@/hooks/use-toast';
import { getOrders } from '@/services/orderService';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<OrderStatus | 'all'>('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState({
    all: 0,
    pending: 0,
    preparing: 0, 
    ready: 0,
    delivered: 0,
    cancelled: 0
  });
  const { toast } = useToast();
  
  const loadOrderCounts = async () => {
    try {
      const orders = await getOrders();
      
      const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };
      
      setOrdersCount(counts);
    } catch (error) {
      console.error('Error cargando conteos de órdenes:', error);
    }
  };
  
  useEffect(() => {
    loadOrderCounts();
  }, []);

  const openNewOrderModal = () => {
    setIsNewOrderModalOpen(true);
  };

  const closeNewOrderModal = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleNewOrderSuccess = () => {
    toast({
      title: "Nueva orden creada",
      description: "La orden ha sido creada correctamente"
    });
    loadOrderCounts();
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
          <Button onClick={openNewOrderModal}>
            <Plus size={18} className="mr-2" /> Nueva Orden
          </Button>
        </div>

        <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="relative">
              Todas
              {ordersCount.all > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-primary/20">
                  {ordersCount.all}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pendientes
              {ordersCount.pending > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-yellow-200 text-yellow-800">
                  {ordersCount.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="relative">
              En Preparación
              {ordersCount.preparing > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-blue-200 text-blue-800">
                  {ordersCount.preparing}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready" className="relative">
              Listas
              {ordersCount.ready > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-green-200 text-green-800">
                  {ordersCount.ready}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="delivered" className="relative">
              Entregadas
              {ordersCount.delivered > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-800">
                  {ordersCount.delivered}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="relative">
              Canceladas
              {ordersCount.cancelled > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-red-200 text-red-800">
                  {ordersCount.cancelled}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="my-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por mesa o número de orden..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="all" className="border rounded-md">
            <OrdersList onRefresh={loadOrderCounts} />
          </TabsContent>

          <TabsContent value="pending" className="border rounded-md">
            <Card>
              <CardContent className="p-0">
                <OrdersList 
                  filter="all" 
                  onRefresh={loadOrderCounts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preparing" className="border rounded-md">
            <Card>
              <CardContent className="p-0">
                <OrdersList 
                  filter="all" 
                  onRefresh={loadOrderCounts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ready" className="border rounded-md">
            <Card>
              <CardContent className="p-0">
                <OrdersList 
                  filter="all" 
                  onRefresh={loadOrderCounts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivered" className="border rounded-md">
            <Card>
              <CardContent className="p-0">
                <OrdersList 
                  filter="all" 
                  onRefresh={loadOrderCounts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="border rounded-md">
            <Card>
              <CardContent className="p-0">
                <OrdersList 
                  filter="all" 
                  onRefresh={loadOrderCounts}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NewOrderModal 
        open={isNewOrderModalOpen} 
        onClose={closeNewOrderModal} 
        onSuccess={handleNewOrderSuccess}
      />
    </Layout>
  );
};

export default Orders;
