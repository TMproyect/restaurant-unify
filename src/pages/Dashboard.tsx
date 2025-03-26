
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AlertsBanner from '@/components/dashboard/AlertsBanner';
import OrdersList from '@/components/dashboard/OrdersList';
import InventoryAlert from '@/components/dashboard/InventoryAlert';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Sample data - In a real app, this would come from your backend
const inventoryAlerts = [
  {
    name: 'Tomates',
    current: 2,
    minimum: 5,
    unit: 'kg'
  },
  {
    name: 'Queso Mozzarella',
    current: 1.5,
    minimum: 3,
    unit: 'kg'
  }
];

const pendingOrders = [
  {
    id: '45',
    table: 'Mesa 3',
    customer: 'Carlos',
    time: '10:30 AM',
    items: [
      '2x Hamburguesa Clásica',
      '1x Ensalada César',
      '1x Papas Fritas (extra crujientes)'
    ]
  },
  {
    id: '46',
    table: 'Mesa 5',
    customer: 'Sofia',
    time: '10:40 AM',
    items: []
  },
  {
    id: '47',
    table: 'Delivery',
    customer: 'Juan',
    time: '10:25 AM',
    items: [
      '1x Pizza Margherita',
      '1x Lasaña',
      '1x Tiramisú'
    ],
    status: 'preparing'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStartPreparation = (orderId: string) => {
    toast({
      title: "Preparación iniciada",
      description: `La orden #${orderId} ha comenzado su preparación`,
    });
    navigate('/kitchen');
  };

  const handleMarkAsReady = (orderId: string) => {
    toast({
      title: "Orden lista",
      description: `La orden #${orderId} ha sido marcada como lista`,
    });
    navigate('/kitchen');
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <AlertsBanner />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle>Pendientes ({pendingOrders.filter(o => !o.status).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.filter(o => !o.status).map(order => (
                  <div key={order.id} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Orden #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">{order.table} - {order.customer}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <ul className="text-sm space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleStartPreparation(order.id)}
                    >
                      Iniciar Preparación
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>En Preparación ({pendingOrders.filter(o => o.status === 'preparing').length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.filter(o => o.status === 'preparing').map(order => (
                  <div key={order.id} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Orden #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">{order.table} - {order.customer}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <ul className="text-sm space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkAsReady(order.id)}
                    >
                      Marcar como Listo
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle>Inventario Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryAlerts.map((item, index) => (
                  <InventoryAlert key={index} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <OrdersList />
      </div>
    </Layout>
  );
};

export default Dashboard;
