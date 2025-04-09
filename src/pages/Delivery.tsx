
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeliveryHeader from '@/components/delivery/DeliveryHeader';
import DeliveryStats from '@/components/delivery/DeliveryStats';
import DeliverySearch from '@/components/delivery/DeliverySearch';
import DeliveryList from '@/components/delivery/DeliveryList';
import { useDeliveryData } from '@/hooks/use-delivery-data';

const Delivery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { deliveries, isLoading, handleAssignDriver, handleMarkDelivered } = useDeliveryData();

  return (
    <Layout>
      <div className="space-y-4">
        <DeliveryHeader />
        <DeliveryStats deliveries={deliveries} />
        <DeliverySearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="en-route">En Ruta</TabsTrigger>
            <TabsTrigger value="delivered">Entregados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            <DeliveryList 
              deliveries={deliveries}
              isLoading={isLoading}
              searchQuery={searchQuery}
              statusFilter="pending"
              onAssignDriver={handleAssignDriver}
              onMarkDelivered={handleMarkDelivered}
            />
          </TabsContent>

          <TabsContent value="en-route" className="mt-4">
            <DeliveryList 
              deliveries={deliveries}
              isLoading={isLoading}
              searchQuery={searchQuery}
              statusFilter="en-route"
              onAssignDriver={handleAssignDriver}
              onMarkDelivered={handleMarkDelivered}
            />
          </TabsContent>

          <TabsContent value="delivered" className="mt-4">
            <DeliveryList 
              deliveries={deliveries}
              isLoading={isLoading}
              searchQuery={searchQuery}
              statusFilter="delivered"
              onAssignDriver={handleAssignDriver}
              onMarkDelivered={handleMarkDelivered}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <DeliveryList 
              deliveries={deliveries}
              isLoading={isLoading}
              searchQuery={searchQuery}
              statusFilter="all"
              onAssignDriver={handleAssignDriver}
              onMarkDelivered={handleMarkDelivered}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Delivery;
