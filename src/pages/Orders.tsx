
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Filter } from 'lucide-react';

// Datos de ejemplo para órdenes
const demoOrders = [
  { id: 1, table: '5', items: 4, status: 'active', time: '14:30', total: '$45.80' },
  { id: 2, table: '3', items: 2, status: 'ready', time: '14:15', total: '$22.50' },
  { id: 3, table: 'Delivery #8', items: 3, status: 'preparing', time: '14:40', total: '$36.20' },
  { id: 4, table: '7', items: 5, status: 'active', time: '14:25', total: '$58.90' },
  { id: 5, table: 'Delivery #9', items: 2, status: 'en route', time: '14:10', total: '$19.45' },
];

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrar órdenes basado en la búsqueda
  const filteredOrders = demoOrders.filter(order => 
    order.table.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.id.toString().includes(searchQuery)
  );

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
          <Button><Plus size={18} className="mr-2" /> Nueva Orden</Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="preparing">En Preparación</TabsTrigger>
            <TabsTrigger value="ready">Listas</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
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

          <TabsContent value="active" className="space-y-4">
            {filteredOrders.filter(order => ['active', 'preparing', 'ready'].includes(order.status)).map(order => (
              <Card key={order.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Mesa {order.table}</p>
                      <p className="text-sm text-muted-foreground">{order.items} items • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status === 'active' ? 'Activa' : 
                         order.status === 'preparing' ? 'Preparando' : 'Lista'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="preparing" className="space-y-4">
            {filteredOrders.filter(order => order.status === 'preparing').map(order => (
              <Card key={order.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Mesa {order.table}</p>
                      <p className="text-sm text-muted-foreground">{order.items} items • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        Preparando
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            {filteredOrders.filter(order => order.status === 'ready').map(order => (
              <Card key={order.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Mesa {order.table}</p>
                      <p className="text-sm text-muted-foreground">{order.items} items • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Lista
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <p className="text-center py-8 text-muted-foreground">No hay órdenes completadas para mostrar.</p>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Orders;
