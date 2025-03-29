
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Package, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Loading notifications in Notifications page");
    loadNotifications();

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications-page-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        payload => {
          console.log('New notification event in page:', payload);
          loadNotifications();
        })
      .subscribe((status) => {
        console.log('Notifications page subscription status:', status);
      });

    return () => {
      console.log("Cleaning up notifications subscription in page");
      supabase.removeChannel(notificationsChannel);
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      // Safely cast the data to the correct type
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Error",
        description: "Could not load notifications",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtramos las notificaciones según la pestaña activa
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  // Función para marcar una notificación como leída
  const handleMarkAsRead = async (id: string) => {
    console.log(`Marking notification ${id} as read`);
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      toast({
        title: "Notificación actualizada",
        description: "Notificación marcada como leída",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Could not mark notification as read",
      });
    }
  };

  // Función para marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    console.log("Marking all notifications as read");
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast({
        title: "Notificaciones actualizadas",
        description: "Todas las notificaciones marcadas como leídas",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Could not mark all notifications as read",
      });
    }
  };

  // Función para manejar el clic en una notificación
  const handleNotificationClick = async (notification: Notification) => {
    console.log(`Notification clicked:`, notification);
    
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    
    if (notification.link) {
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
            onClick={handleMarkAllAsRead}
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
            {loading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Cargando notificaciones...</p>
              </div>
            ) : (
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
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {new Date(notification.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        
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
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
