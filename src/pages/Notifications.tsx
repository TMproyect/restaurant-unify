
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Package, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

// Definimos una interfaz para las notificaciones
interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  type?: 'order' | 'inventory' | 'table' | 'system';
}

// Sample notifications for demo
const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 1, message: 'Pedido #45 listo para entregar', time: '2 min atrás', read: false, link: '/orders', type: 'order' },
  { id: 2, message: 'Inventario bajo: Tomates', time: '10 min atrás', read: false, link: '/inventory', type: 'inventory' },
  { id: 3, message: 'Nuevo pedido en Mesa 3', time: '15 min atrás', read: true, link: '/tables', type: 'table' },
  { id: 4, message: 'Nuevo usuario registrado: Carlos', time: '1 hora atrás', read: true, link: '/staff', type: 'system' },
  { id: 5, message: 'Actualización de menú completada', time: '2 horas atrás', read: true, link: '/menu', type: 'system' },
  { id: 6, message: 'Pedido #42 entregado', time: '3 horas atrás', read: true, link: '/orders', type: 'order' },
  { id: 7, message: 'Inventario bajo: Queso mozzarella', time: '4 horas atrás', read: true, link: '/inventory', type: 'inventory' },
];

const NotificationIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-5 w-5 text-blue-500" />;
    case 'inventory':
      return <Package className="h-5 w-5 text-yellow-500" />;
    case 'table':
      return <Users className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Cargando notificaciones en la página de Notificaciones");
    // Aquí cargaríamos las notificaciones desde Supabase en una aplicación real
  }, []);

  // Filtramos las notificaciones según la pestaña activa
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  // Función para marcar una notificación como leída
  const markAsRead = (id: number) => {
    console.log(`Marcando notificación ${id} como leída`);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    toast({
      title: "Notificación actualizada",
      description: "Notificación marcada como leída",
    });
  };

  // Función para marcar todas como leídas
  const markAllAsRead = () => {
    console.log("Marcando todas las notificaciones como leídas");
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    toast({
      title: "Notificaciones actualizadas",
      description: "Todas las notificaciones marcadas como leídas",
    });
  };

  // Función para manejar el clic en una notificación
  const handleNotificationClick = (notification: Notification) => {
    console.log(`Notificación clickeada:`, notification);
    if (notification.link) {
      markAsRead(notification.id);
      navigate(notification.link);
      
      toast({
        title: "Navegando",
        description: `Redirigiendo a ${notification.link}`,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
            className="self-start"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="all">
                  Todas 
                  <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Sin leer
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="order">Pedidos</TabsTrigger>
                <TabsTrigger value="inventory">Inventario</TabsTrigger>
                <TabsTrigger value="table">Mesas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors",
                      !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <NotificationIcon type={notification.type} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={cn("text-sm", !notification.read && "font-medium")}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.read ? 'Leída' : 'Sin leer'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-muted-foreground">No hay notificaciones para mostrar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
