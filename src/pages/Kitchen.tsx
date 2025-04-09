
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Check, ChefHat, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
import { supabase } from '@/integrations/supabase/client';
import { getOrderWithItems, updateOrderStatus, subscribeToOrders, subscribeToFilteredOrders, Order } from '@/services/orderService';
import { mapArrayResponse, filterValue } from '@/utils/supabaseHelpers';
import { useAuth } from '@/contexts/auth/AuthContext';

// Kitchen options constants
const kitchenOptions = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
];

interface OrderDisplay {
  id: string;
  table: string;
  customerName: string;
  time: string;
  kitchenId: string;
  status: string;
  items: {
    name: string;
    notes: string;
    id: string;
    quantity: number;
  }[];
}

const Kitchen = () => {
  const [selectedKitchen, setSelectedKitchen] = useState("main");
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'ready'>('pending');
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  
  // Verificar permisos del usuario
  const hasViewPermission = user?.role === 'admin' || 
                            user?.role === 'propietario' ||
                            user?.role === 'gerente' ||
                            user?.role === 'cocina' || 
                            user?.role === 'kitchen';
  
  const hasManagePermission = user?.role === 'admin' || 
                             user?.role === 'propietario' ||
                             user?.role === 'gerente' ||
                             user?.role === 'cocina' || 
                             user?.role === 'kitchen';
  
  console.log('🔍 [Kitchen] Comprobando permisos del usuario:', { 
    role: user?.role, 
    hasViewPermission, 
    hasManagePermission 
  });
  
  // Función para refrescar los datos
  const handleRefresh = () => {
    console.log('🔄 [Kitchen] Refreshing orders list');
    setRefreshKey(prev => prev + 1);
  };

  // Efecto para cargar órdenes
  useEffect(() => {
    if (!hasViewPermission) {
      console.log('⛔ [Kitchen] Usuario sin permisos para ver la cocina');
      return;
    }
    
    console.log('🔄 [Kitchen] Loading orders for kitchen:', selectedKitchen);
    loadOrders();
    
    // Suscribirse a cambios en órdenes
    try {
      console.log('🔄 [Kitchen] Setting up realtime subscription...');
      
      // Usar suscripción filtrada si hay un filtro activo para la cocina
      const unsubscribe = subscribeToFilteredOrders(orderStatus, handleRealtimeUpdate);
      
      // Función para manejar las actualizaciones en tiempo real
      function handleRealtimeUpdate(payload: any) {
        console.log('✅ [Kitchen] Realtime order update received:', payload);
        
        // Verificar si la orden es para esta cocina
        const order = payload.new;
        if (order && order.kitchen_id === selectedKitchen) {
          console.log('✅ [Kitchen] Order is for this kitchen:', selectedKitchen);
          
          // Notificación cuando se crea una nueva orden
          if (payload.eventType === 'INSERT') {
            toast.success(`Nueva orden recibida: ${order.customer_name} - Mesa: ${order.table_number || 'Delivery'}`, {
              duration: 5000,
            });
          }
          
          // Recargar órdenes para obtener datos actualizados
          loadOrders();
        } else {
          console.log('ℹ️ [Kitchen] Order is not for this kitchen or status filter');
        }
      }
      
      return () => {
        console.log('🔄 [Kitchen] Cleaning up realtime subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [Kitchen] Error setting up realtime subscription:', error);
      toast.error("Error al conectar con actualizaciones en tiempo real");
    }
  }, [selectedKitchen, orderStatus, refreshKey, hasViewPermission]);

  // Cargar órdenes desde Supabase
  const loadOrders = async () => {
    if (!hasViewPermission) return;
    
    try {
      setLoading(true);
      console.log(`🔍 [Kitchen] Loading orders for kitchen ${selectedKitchen} with status filter ${orderStatus}`);
      
      // Construir la consulta base - CORREGIDA para evitar el error de status en order_items
      let query = supabase
        .from('orders')
        .select(`
          id,
          table_number,
          customer_name,
          status,
          is_delivery,
          kitchen_id,
          created_at,
          updated_at,
          order_items (
            id,
            name,
            quantity,
            notes
          )
        `)
        .eq('kitchen_id', filterValue(selectedKitchen));
      
      // Agregar filtro de estado si no es 'all'
      if (orderStatus === 'pending') {
        query = query.eq('status', 'pending');
      } else if (orderStatus === 'preparing') {
        query = query.eq('status', 'preparing');
      } else if (orderStatus === 'ready') {
        query = query.in('status', ['ready', 'delivered']);
      }
      
      // Ejecutar la consulta
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [Kitchen] Error loading orders:', error);
        throw error;
      }
      
      console.log(`✅ [Kitchen] Received ${data?.length || 0} orders from Supabase`);
      
      if (!data) {
        setOrders([]);
        return;
      }
      
      // Map and ensure we have data with proper type
      type ExtendedOrder = Order & { order_items: any[] };
      const typedData = mapArrayResponse<ExtendedOrder>(data, 'Failed to map orders for kitchen');
      
      // Formatear las órdenes para el componente
      const formattedOrders: OrderDisplay[] = typedData.map(order => ({
        id: order.id || '',
        table: order.is_delivery ? 'Delivery' : String(order.table_number),
        customerName: order.customer_name,
        time: new Date(order.created_at || '').toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        kitchenId: order.kitchen_id || '',
        status: order.status,
        items: (order.order_items || []).map((item: any) => ({
          name: item.name,
          notes: item.notes || '',
          id: item.id,
          quantity: item.quantity
        }))
      }));
      
      console.log('✅ [Kitchen] Formatted orders:', formattedOrders);
      setOrders(formattedOrders);
    } catch (error) {
      console.error('❌ [Kitchen] Error loading orders:', error);
      toast.error('Error al cargar los pedidos para cocina');
    } finally {
      setLoading(false);
    }
  };

  // Function to update the status of an order
  const updateOrderStatusInKitchen = async (orderId: string, newStatus: string) => {
    if (!hasManagePermission) {
      toast.error("No tienes permisos para actualizar el estado de órdenes");
      return;
    }
    
    try {
      console.log(`🔄 [Kitchen] Updating order ${orderId} status to ${newStatus}`);
      setLoading(true);
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        toast.success(`Estado de la orden actualizado a "${
          newStatus === 'pending' ? 'Pendiente' :
          newStatus === 'preparing' ? 'En preparación' :
          newStatus === 'ready' ? 'Lista' :
          newStatus === 'delivered' ? 'Entregada' :
          newStatus === 'cancelled' ? 'Cancelada' : newStatus
        }"`);
        
        // Recargar órdenes para reflejar el cambio
        loadOrders();
      } else {
        console.error('❌ [Kitchen] Failed to update order status');
        toast.error("No se pudo actualizar el estado de la orden");
      }
    } catch (error) {
      console.error('❌ [Kitchen] Error updating order status:', error);
      toast.error("Ocurrió un error al actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  // Get statistics for the selected kitchen
  const getKitchenStats = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const preparingOrders = orders.filter(order => order.status === 'preparing');
    const completedOrders = orders.filter(order => 
      order.status === 'ready' || order.status === 'delivered'
    );
    
    return { 
      pendingItems: pendingOrders.length, 
      preparingItems: preparingOrders.length, 
      completedItems: completedOrders.length,
      totalItems: orders.length
    };
  };

  const stats = getKitchenStats();
  
  // Calculate average preparation time (mock data for demo)
  const getAverageTime = () => {
    // En una app real, esto se calcularía de datos reales
    const times: Record<string, number> = {
      'main': 15,
      'grill': 18,
      'cold': 10,
      'pastry': 20
    };
    
    return times[selectedKitchen] || 15;
  };

  // Get kitchen name from ID
  const getKitchenName = (kitchenId: string) => {
    const kitchen = kitchenOptions.find(k => k.id === kitchenId);
    return kitchen ? kitchen.name : 'Desconocida';
  };

  // Filtrar órdenes por estado (esto debería ser redundante con la consulta,
  // pero proporciona una capa adicional de seguridad)
  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (orderStatus === 'pending') {
        return order.status === 'pending';
      } else if (orderStatus === 'preparing') {
        return order.status === 'preparing';
      } else if (orderStatus === 'ready') {
        return order.status === 'ready' || order.status === 'delivered';
      }
      return false;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Si el usuario no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasViewPermission) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-center">Acceso no permitido</h1>
          <p className="text-muted-foreground text-center">
            No tienes permisos para ver la pantalla de cocina.
          </p>
        </div>
      </Layout>
    );
  }

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
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" className="gap-2">
              <Clock size={16} />
              Tiempo prom: {getAverageTime()} min
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
            <TabsTrigger value="ready" className="relative">
              Completados
              {stats.completedItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.completedItems}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <Card key={order.id} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Orden #{order.id.substring(0, 4)} - {order.table}</CardTitle>
                          <span className="text-sm text-muted-foreground">{order.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                          <div className="flex gap-2">
                            <p className="text-xs bg-secondary/50 px-2 py-1 rounded">
                              {getKitchenName(order.kitchenId)}
                            </p>
                            {hasManagePermission && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7"
                                onClick={() => updateOrderStatusInKitchen(order.id, 'preparing')}
                              >
                                <ChefHat size={14} className="mr-1" /> Preparar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="p-3 rounded bg-secondary/30">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <p className="font-medium">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</p>
                                  {item.notes && (
                                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                      <AlertCircle size={12} />
                                      <p>{item.notes}</p>
                                    </div>
                                  )}
                                </div>
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
                    <Card key={order.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Orden #{order.id.substring(0, 4)} - {order.table}</CardTitle>
                          <span className="text-sm text-muted-foreground">{order.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                          <div className="flex gap-2">
                            <p className="text-xs bg-secondary/50 px-2 py-1 rounded">
                              {getKitchenName(order.kitchenId)}
                            </p>
                            {hasManagePermission && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7"
                                onClick={() => updateOrderStatusInKitchen(order.id, 'ready')}
                              >
                                <Check size={14} className="mr-1" /> Completado
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="p-3 rounded bg-secondary/30">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <p className="font-medium">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</p>
                                  {item.notes && (
                                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                      <AlertCircle size={12} />
                                      <p>{item.notes}</p>
                                    </div>
                                  )}
                                </div>
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

              <TabsContent value="ready" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <Card key={order.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Orden #{order.id.substring(0, 4)} - {order.table}</CardTitle>
                          <span className="text-sm text-muted-foreground">{order.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                          <p className="text-xs bg-secondary/50 px-2 py-1 rounded">
                            {getKitchenName(order.kitchenId)}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="p-3 rounded bg-secondary/30">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <p className="font-medium">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</p>
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
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Kitchen;
