
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin, Phone, Clock } from 'lucide-react';

// Datos de ejemplo para entregas
const deliveries = [
  { 
    id: 1, 
    customer: 'María García', 
    address: 'Calle Principal 123, Apto 4B', 
    phone: '+1234567890', 
    items: 3, 
    total: '$42.50', 
    time: '15:00',
    status: 'pending',
    assignedTo: ''
  },
  { 
    id: 2, 
    customer: 'Carlos Rodríguez', 
    address: 'Av. Libertad 456', 
    phone: '+1234567891', 
    items: 2, 
    total: '$28.75', 
    time: '15:10',
    status: 'preparing',
    assignedTo: ''
  },
  { 
    id: 3, 
    customer: 'Laura Martínez', 
    address: 'Plaza Central 78, Edificio B', 
    phone: '+1234567892', 
    items: 4, 
    total: '$53.20', 
    time: '14:40',
    status: 'en-route',
    assignedTo: 'Miguel Pérez'
  },
  { 
    id: 4, 
    customer: 'Juan Sánchez', 
    address: 'Calle Secundaria 87', 
    phone: '+1234567893', 
    items: 1, 
    total: '$18.90', 
    time: '14:30',
    status: 'delivered',
    assignedTo: 'Ana López'
  },
  { 
    id: 5, 
    customer: 'Elena Gómez', 
    address: 'Av. Norte 32, Casa 5', 
    phone: '+1234567894', 
    items: 3, 
    total: '$37.45', 
    time: '14:15',
    status: 'delivered',
    assignedTo: 'Miguel Pérez'
  },
];

const Delivery = () => {
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
              <p className="text-2xl font-bold">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">En Ruta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Entregados Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente o dirección..."
            className="pl-8 mb-4"
          />
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="en-route">En Ruta</TabsTrigger>
            <TabsTrigger value="delivered">Entregados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4 space-y-4">
            {deliveries.filter(d => d.status === 'pending' || d.status === 'preparing').map(delivery => (
              <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold">{delivery.customer}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-1" />
                        <span>{delivery.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone size={14} className="mr-1" />
                        <span>{delivery.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock size={14} className="mr-1 text-muted-foreground" />
                        <span>Programado: {delivery.time}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="flex flex-col h-full justify-between items-end">
                        <div>
                          <p className="font-bold">{delivery.total}</p>
                          <p className="text-xs text-muted-foreground">{delivery.items} items</p>
                        </div>
                        <div className="mt-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {delivery.status === 'pending' ? 'Pendiente' : 'Preparando'}
                          </span>
                        </div>
                        <Button className="mt-3" size="sm">Asignar Repartidor</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="en-route" className="mt-4 space-y-4">
            {deliveries.filter(d => d.status === 'en-route').map(delivery => (
              <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold">{delivery.customer}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-1" />
                        <span>{delivery.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone size={14} className="mr-1" />
                        <span>{delivery.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock size={14} className="mr-1 text-muted-foreground" />
                        <span>Programado: {delivery.time}</span>
                      </div>
                      <p className="text-sm font-medium">Repartidor: {delivery.assignedTo}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="flex flex-col h-full justify-between items-end">
                        <div>
                          <p className="font-bold">{delivery.total}</p>
                          <p className="text-xs text-muted-foreground">{delivery.items} items</p>
                        </div>
                        <div className="mt-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            En Ruta
                          </span>
                        </div>
                        <Button className="mt-3" size="sm" variant="secondary">Marcar como Entregado</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="delivered" className="mt-4 space-y-4">
            {deliveries.filter(d => d.status === 'delivered').map(delivery => (
              <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold">{delivery.customer}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-1" />
                        <span>{delivery.address}</span>
                      </div>
                      <p className="text-sm font-medium">Repartidor: {delivery.assignedTo}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="flex flex-col h-full justify-between items-end">
                        <div>
                          <p className="font-bold">{delivery.total}</p>
                          <p className="text-xs text-muted-foreground">Entregado: {delivery.time}</p>
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
            ))}
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-4">
            {deliveries.map(delivery => (
              <Card key={delivery.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold">{delivery.customer}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-1" />
                        <span>{delivery.address}</span>
                      </div>
                      {delivery.assignedTo && <p className="text-sm font-medium">Repartidor: {delivery.assignedTo}</p>}
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="flex flex-col h-full justify-between items-end">
                        <div>
                          <p className="font-bold">{delivery.total}</p>
                          <p className="text-xs text-muted-foreground">{delivery.time}</p>
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default Delivery;
