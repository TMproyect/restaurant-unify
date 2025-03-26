
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Check, ChefHat, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Constantes de cocinas
const kitchenOptions = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
];

// Cada orden ahora incluye a qué cocina pertenece
const kitchenOrders = [
  { 
    id: 1, 
    table: '5', 
    customerName: 'Carlos',
    time: '10:30', 
    kitchenId: 'main',
    items: [
      { name: 'Pollo a la parrilla', notes: 'Sin salsa', status: 'pending' },
      { name: 'Ensalada César', notes: 'Sin crutones', status: 'pending' },
      { name: 'Papas fritas', notes: 'Extra crujientes', status: 'pending' },
    ]
  },
  { 
    id: 2, 
    table: '3', 
    customerName: 'María',
    time: '10:15', 
    kitchenId: 'cold',
    items: [
      { name: 'Pasta Carbonara', notes: 'Extra queso', status: 'completed' },
      { name: 'Pan de ajo', notes: '', status: 'completed' },
    ]
  },
  { 
    id: 3, 
    table: 'Delivery', 
    customerName: 'Juan',
    time: '10:25', 
    kitchenId: 'grill',
    items: [
      { name: 'Pizza Margherita', notes: 'Sin albahaca', status: 'preparing' },
      { name: 'Alitas de pollo', notes: 'Salsa picante', status: 'pending' },
      { name: 'Tiramisu', notes: '', status: 'completed' },
    ]
  },
  { 
    id: 4, 
    table: '7', 
    customerName: 'Alberto',
    time: '10:40', 
    kitchenId: 'pastry',
    items: [
      { name: 'Tarta de chocolate', notes: 'Con helado', status: 'pending' },
      { name: 'Brownie', notes: 'Caliente', status: 'pending' },
    ]
  },
];

const Kitchen = () => {
  const [selectedKitchen, setSelectedKitchen] = useState("main");
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'completed'>('pending');
  const { toast } = useToast();

  // Filtrar órdenes por cocina seleccionada y estado
  const filteredOrders = kitchenOrders
    .filter(order => order.kitchenId === selectedKitchen)
    .filter(order => {
      return order.items.some(item => 
        (orderStatus === 'pending' && item.status === 'pending') ||
        (orderStatus === 'preparing' && item.status === 'preparing') ||
        (orderStatus === 'completed' && item.status === 'completed')
      );
    });

  // Función para actualizar el estado de un item
  const updateItemStatus = (orderId: number, itemIndex: number, newStatus: 'pending' | 'preparing' | 'completed') => {
    // En una aplicación real, aquí enviaríamos la actualización al backend
    // Aquí solo actualizamos el estado local
    const order = kitchenOrders.find(o => o.id === orderId);
    if (order && order.items[itemIndex]) {
      order.items[itemIndex].status = newStatus;
      
      // Mostrar notificación
      const statusText = newStatus === 'preparing' ? 'preparación' : 'completado';
      toast({
        title: `Item en ${statusText}`,
        description: `${order.items[itemIndex].name} para la mesa ${order.table} actualizado`,
      });
    }
  };

  // Contar items por estado para cada cocina
  const getKitchenStats = (kitchenId: string) => {
    const kitchen = kitchenOrders.filter(order => order.kitchenId === kitchenId);
    
    const pendingItems = kitchen.flatMap(order => 
      order.items.filter(item => item.status === 'pending')
    ).length;
    
    const preparingItems = kitchen.flatMap(order => 
      order.items.filter(item => item.status === 'preparing')
    ).length;
    
    const completedItems = kitchen.flatMap(order => 
      order.items.filter(item => item.status === 'completed')
    ).length;
    
    return { pendingItems, preparingItems, completedItems };
  };

  const stats = getKitchenStats(selectedKitchen);

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2">
                  <ChefHat size={16} />
                  Estadísticas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="flex justify-between">
                  Pendientes <span className="font-bold ml-2">{stats.pendingItems}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between">
                  En preparación <span className="font-bold ml-2">{stats.preparingItems}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between">
                  Completados <span className="font-bold ml-2">{stats.completedItems}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full" onValueChange={(value) => setOrderStatus(value as typeof orderStatus)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="preparing">En preparación</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Orden #{order.id} - {order.table}</CardTitle>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {order.items.filter(item => item.status === 'pending').map((item, index) => (
                        <li key={index} className="p-3 rounded bg-secondary/30">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                  <AlertCircle size={12} />
                                  <p>{item.notes}</p>
                                </div>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={() => updateItemStatus(order.id, index, 'preparing')}
                            >
                              <ChefHat size={14} className="mr-1" /> Preparar
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                No hay órdenes pendientes para {kitchenOptions.find(k => k.id === selectedKitchen)?.name}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preparing" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Orden #{order.id} - {order.table}</CardTitle>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {order.items.filter(item => item.status === 'preparing').map((item, index) => (
                        <li key={index} className="p-3 rounded bg-secondary/30">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                  <AlertCircle size={12} />
                                  <p>{item.notes}</p>
                                </div>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={() => updateItemStatus(order.id, index, 'completed')}
                            >
                              <Check size={14} className="mr-1" /> Listo
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                No hay órdenes en preparación para {kitchenOptions.find(k => k.id === selectedKitchen)?.name}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Orden #{order.id} - {order.table}</CardTitle>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {order.items.filter(item => item.status === 'completed').map((item, index) => (
                        <li key={index} className="p-3 rounded bg-secondary/30">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                  <AlertCircle size={12} />
                                  <p>{item.notes}</p>
                                </div>
                              )}
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              Completado
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                No hay órdenes completadas para {kitchenOptions.find(k => k.id === selectedKitchen)?.name}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Kitchen;
