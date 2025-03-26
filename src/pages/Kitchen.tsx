import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Check, ChefHat } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const kitchenOptions = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
];

const kitchenOrders = [
  { 
    id: 1, 
    table: '5', 
    time: '14:30', 
    items: [
      { name: 'Pollo a la parrilla', notes: 'Sin salsa', status: 'preparing' },
      { name: 'Ensalada César', notes: 'Sin crutones', status: 'pending' },
      { name: 'Papas fritas', notes: '', status: 'pending' },
    ]
  },
  { 
    id: 2, 
    table: '3', 
    time: '14:15', 
    items: [
      { name: 'Pasta Carbonara', notes: 'Extra queso', status: 'completed' },
      { name: 'Pan de ajo', notes: '', status: 'completed' },
    ]
  },
  { 
    id: 3, 
    table: 'Delivery #8', 
    time: '14:40', 
    items: [
      { name: 'Pizza Margherita', notes: 'Sin albahaca', status: 'preparing' },
      { name: 'Alitas de pollo', notes: 'Salsa picante', status: 'pending' },
      { name: 'Refresco de cola', notes: '', status: 'completed' },
    ]
  },
];

const Kitchen = () => {
  const [selectedKitchen, setSelectedKitchen] = useState("main");
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'completed'>('pending');

  const filteredOrders = kitchenOrders.filter(order => {
    return order.items.some(item => 
      (orderStatus === 'pending' && item.status === 'pending') ||
      (orderStatus === 'preparing' && item.status === 'preparing') ||
      (orderStatus === 'completed' && item.status === 'completed')
    );
  });

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Cocina</h1>
          
          <div className="w-full md:w-72">
            <Select value={selectedKitchen} onValueChange={setSelectedKitchen}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área de cocina" />
              </SelectTrigger>
              <SelectContent>
                {kitchenOptions.map(kitchen => (
                  <SelectItem key={kitchen.id} value={kitchen.id}>
                    {kitchen.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Clock size={16} />
              Tiempo promedio: 18 min
            </Button>
            <Button variant="default" className="gap-2">
              <ChefHat size={16} />
              {filteredOrders.length} órdenes activas
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full" onValueChange={(value) => setOrderStatus(value as typeof orderStatus)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="preparing">En preparación</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <Card key={order.id} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Mesa {order.table}</CardTitle>
                    <span className="text-sm text-muted-foreground">{order.time}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {order.items.filter(item => item.status === 'pending').map((item, index) => (
                      <li key={index} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => {
                            item.status = 'preparing';
                          }}
                        >
                          <ChefHat size={14} className="mr-1" /> Preparar
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="preparing" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <Card key={order.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Mesa {order.table}</CardTitle>
                    <span className="text-sm text-muted-foreground">{order.time}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {order.items.filter(item => item.status === 'preparing').map((item, index) => (
                      <li key={index} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => {
                            item.status = 'completed';
                          }}
                        >
                          <Check size={14} className="mr-1" /> Listo
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <Card key={order.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Mesa {order.table}</CardTitle>
                    <span className="text-sm text-muted-foreground">{order.time}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {order.items.filter(item => item.status === 'completed').map((item, index) => (
                      <li key={index} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Completado
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Kitchen;
