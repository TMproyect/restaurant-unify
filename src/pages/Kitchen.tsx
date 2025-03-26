
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

// Kitchen options constants
const kitchenOptions = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
];

// Initial orders data - in a real app, this would come from an API
const initialOrders = [
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
  const [orders, setOrders] = useState(initialOrders);
  const { toast } = useToast();

  // Effect to load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('kitchenOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Effect to save orders to localStorage when they change
  useEffect(() => {
    localStorage.setItem('kitchenOrders', JSON.stringify(orders));
  }, [orders]);

  // Filter orders by kitchen selected and status
  const filteredOrders = orders
    .filter(order => order.kitchenId === selectedKitchen)
    .filter(order => {
      return order.items.some(item => 
        (orderStatus === 'pending' && item.status === 'pending') ||
        (orderStatus === 'preparing' && item.status === 'preparing') ||
        (orderStatus === 'completed' && item.status === 'completed')
      );
    });

  // Function to update the status of an item
  const updateItemStatus = (orderId: number, itemIndex: number, newStatus: 'pending' | 'preparing' | 'completed') => {
    setOrders(prevOrders => {
      const updatedOrders = [...prevOrders];
      const orderIndex = updatedOrders.findIndex(o => o.id === orderId);
      
      if (orderIndex !== -1 && updatedOrders[orderIndex].items[itemIndex]) {
        // Create a new items array with the updated status
        const updatedItems = [...updatedOrders[orderIndex].items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          status: newStatus
        };
        
        // Update the order with the new items array
        updatedOrders[orderIndex] = {
          ...updatedOrders[orderIndex],
          items: updatedItems
        };
        
        // Show notification
        const statusText = newStatus === 'preparing' ? 'preparación' : 'completado';
        toast({
          title: `Item en ${statusText}`,
          description: `${updatedItems[itemIndex].name} para la mesa ${updatedOrders[orderIndex].table} actualizado`,
        });
        
        return updatedOrders;
      }
      
      return prevOrders;
    });
  };

  // Reset all orders to initial state (for demo purposes)
  const resetOrders = () => {
    setOrders(initialOrders);
    toast({
      title: "Órdenes reiniciadas",
      description: "Todas las órdenes han sido reiniciadas a su estado inicial",
    });
  };

  // Get statistics for the selected kitchen
  const getKitchenStats = (kitchenId: string) => {
    const kitchenOrders = orders.filter(order => order.kitchenId === kitchenId);
    
    const pendingItems = kitchenOrders.flatMap(order => 
      order.items.filter(item => item.status === 'pending')
    ).length;
    
    const preparingItems = kitchenOrders.flatMap(order => 
      order.items.filter(item => item.status === 'preparing')
    ).length;
    
    const completedItems = kitchenOrders.flatMap(order => 
      order.items.filter(item => item.status === 'completed')
    ).length;
    
    const totalItems = pendingItems + preparingItems + completedItems;
    
    return { 
      pendingItems, 
      preparingItems, 
      completedItems,
      totalItems
    };
  };

  const stats = getKitchenStats(selectedKitchen);
  
  // Calculate average preparation time (mock data for demo)
  const getAverageTime = () => {
    // In a real app, this would be calculated from actual timing data
    const times = {
      'main': 15,
      'grill': 18,
      'cold': 10,
      'pastry': 20
    };
    
    return times[selectedKitchen as keyof typeof times] || 15;
  };

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
              Tiempo promedio: {getAverageTime()} min
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2">
                  <ChefHat size={16} />
                  Estadísticas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem className="flex justify-between">
                  Pendientes <span className="font-bold ml-2">{stats.pendingItems}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between">
                  En preparación <span className="font-bold ml-2">{stats.preparingItems}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between">
                  Completados <span className="font-bold ml-2">{stats.completedItems}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex justify-between border-t border-border mt-1 pt-1">
                  Total <span className="font-bold ml-2">{stats.totalItems}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={resetOrders} 
              className="h-10"
              title="Reiniciar órdenes (Solo para demostración)"
            >
              Reiniciar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full" onValueChange={(value) => setOrderStatus(value as typeof orderStatus)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pendientes
              {stats.pendingItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pendingItems}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="relative">
              En preparación
              {stats.preparingItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.preparingItems}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Completados
              {stats.completedItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.completedItems}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Orden #{order.id} - {order.table}</CardTitle>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {order.items.filter(item => item.status === 'pending').map((item, index) => {
                        // Find the actual index in the original items array
                        const originalIndex = order.items.findIndex(i => i.name === item.name && i.notes === item.notes);
                        
                        return (
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
                                onClick={() => updateItemStatus(order.id, originalIndex, 'preparing')}
                              >
                                <ChefHat size={14} className="mr-1" /> Preparar
                              </Button>
                            </div>
                          </li>
                        );
                      })}
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
                <Card key={order.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Orden #{order.id} - {order.table}</CardTitle>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {order.items.filter(item => item.status === 'preparing').map((item, index) => {
                        // Find the actual index in the original items array
                        const originalIndex = order.items.findIndex(i => i.name === item.name && i.notes === item.notes);
                        
                        return (
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
                                onClick={() => updateItemStatus(order.id, originalIndex, 'completed')}
                              >
                                <Check size={14} className="mr-1" /> Listo
                              </Button>
                            </div>
                          </li>
                        );
                      })}
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
                <Card key={order.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
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
