
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin, Phone, Clock, Loader2 } from 'lucide-react';
import { 
  getDeliveryOrders, 
  assignDeliveryDriver, 
  markDeliveryCompleted,
  type DeliveryOrder 
} from '@/services/delivery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';

const Delivery = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadDeliveryOrders();
  }, []);

  const loadDeliveryOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getDeliveryOrders();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading delivery orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos de entrega",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: string) => {
    if (!user) return;
    
    try {
      const success = await assignDeliveryDriver(
        orderId,
        user.id,
        user.name
      );
      
      if (success) {
        toast({
          title: "Repartidor asignado",
          description: "Se te ha asignado este pedido"
        });
        loadDeliveryOrders();
      } else {
        toast({
          title: "Error",
          description: "No se pudo asignar el repartidor",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al asignar el repartidor",
        variant: "destructive"
      });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const success = await markDeliveryCompleted(orderId);
      
      if (success) {
        toast({
          title: "Entrega completada",
          description: "El pedido ha sido marcado como entregado"
        });
        loadDeliveryOrders();
      } else {
        toast({
          title: "Error",
          description: "No se pudo marcar el pedido como entregado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error marking delivery as completed:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al marcar la entrega como completada",
        variant: "destructive"
      });
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = delivery.customer_name.toLowerCase().includes(query);
      const matchesAddress = delivery.address?.street?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesAddress) {
        return false;
      }
    }
    
    // Filter by status tab
    if (activeTab === 'pending') {
      return delivery.status === 'pending' || delivery.status === 'preparing';
    } else if (activeTab === 'en-route') {
      return delivery.status === 'en-route';
    } else if (activeTab === 'delivered') {
      return delivery.status === 'delivered';
    }
    
    return true; // 'all' tab
  });

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Entregas</h1>
          <Button><Plus size={18} className="mr-2" /> Nueva Entrega</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Entregas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {deliveries.filter(d => d.status === 'pending' || d.status === 'preparing').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">En Ruta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {deliveries.filter(d => d.status === 'en-route').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Entregados Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {deliveries.filter(d => d.status === 'delivered').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente o dirección..."
            className="pl-8 mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="en-route">En Ruta</TabsTrigger>
            <TabsTrigger value="delivered">Entregados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-1">No se encontraron entregas</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No hay resultados para "${searchQuery}"`
                  : `No hay entregas ${
                      activeTab === 'pending' ? 'pendientes' : 
                      activeTab === 'en-route' ? 'en ruta' : 
                      activeTab === 'delivered' ? 'entregadas' : ''
                    }`
                }
              </p>
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="mt-4 space-y-4">
                {filteredDeliveries
                  .filter(d => d.status === 'pending' || d.status === 'preparing')
                  .map(delivery => (
                    <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-2">
                            <h3 className="font-bold">{delivery.customer_name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin size={14} className="mr-1" />
                              <span>{delivery.address?.street}, {delivery.address?.city}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone size={14} className="mr-1" />
                              <span>{delivery.phone_number || 'No disponible'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock size={14} className="mr-1 text-muted-foreground" />
                              <span>Programado: {new Date(delivery.created_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="flex flex-col h-full justify-between items-end">
                              <div>
                                <p className="font-bold">${delivery.total.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{delivery.items_count} items</p>
                              </div>
                              <div className="mt-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {delivery.status === 'pending' ? 'Pendiente' : 'Preparando'}
                                </span>
                              </div>
                              <Button 
                                className="mt-3" 
                                size="sm"
                                onClick={() => handleAssignDriver(delivery.id || '')}
                              >
                                Asignar Repartidor
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </TabsContent>

              <TabsContent value="en-route" className="mt-4 space-y-4">
                {filteredDeliveries
                  .filter(d => d.status === 'en-route')
                  .map(delivery => (
                    <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-2">
                            <h3 className="font-bold">{delivery.customer_name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin size={14} className="mr-1" />
                              <span>{delivery.address?.street}, {delivery.address?.city}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone size={14} className="mr-1" />
                              <span>{delivery.phone_number || 'No disponible'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock size={14} className="mr-1 text-muted-foreground" />
                              <span>Programado: {new Date(delivery.created_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-sm font-medium">Repartidor: {delivery.driver_name || 'No asignado'}</p>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="flex flex-col h-full justify-between items-end">
                              <div>
                                <p className="font-bold">${delivery.total.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{delivery.items_count} items</p>
                              </div>
                              <div className="mt-4">
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  En Ruta
                                </span>
                              </div>
                              <Button 
                                className="mt-3" 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleMarkDelivered(delivery.id || '')}
                              >
                                Marcar como Entregado
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </TabsContent>

              <TabsContent value="delivered" className="mt-4 space-y-4">
                {filteredDeliveries
                  .filter(d => d.status === 'delivered')
                  .map(delivery => (
                    <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-2">
                            <h3 className="font-bold">{delivery.customer_name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin size={14} className="mr-1" />
                              <span>{delivery.address?.street}, {delivery.address?.city}</span>
                            </div>
                            <p className="text-sm font-medium">Repartidor: {delivery.driver_name || 'No asignado'}</p>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="flex flex-col h-full justify-between items-end">
                              <div>
                                <p className="font-bold">${delivery.total.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                  Entregado: {new Date(delivery.updated_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                              <div className="mt-4">
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                  Entregado
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </TabsContent>

              <TabsContent value="all" className="mt-4 space-y-4">
                {filteredDeliveries.map(delivery => (
                  <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <h3 className="font-bold">{delivery.customer_name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin size={14} className="mr-1" />
                            <span>{delivery.address?.street}, {delivery.address?.city}</span>
                          </div>
                          {delivery.driver_name && <p className="text-sm font-medium">Repartidor: {delivery.driver_name}</p>}
                        </div>
                        <div className="mt-4 md:mt-0 md:text-right">
                          <div className="flex flex-col h-full justify-between items-end">
                            <div>
                              <p className="font-bold">${delivery.total.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(delivery.created_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                            <div className="mt-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                delivery.status === 'preparing' ? 'bg-blue-100 text-blue-800' : 
                                delivery.status === 'en-route' ? 'bg-indigo-100 text-indigo-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {delivery.status === 'pending' ? 'Pendiente' : 
                                 delivery.status === 'preparing' ? 'Preparando' : 
                                 delivery.status === 'en-route' ? 'En Ruta' : 'Entregado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Delivery;
