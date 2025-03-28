
import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Definimos una interfaz para las notificaciones
interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  type?: 'order' | 'inventory' | 'table' | 'system';
}

// Sample notifications for demo - Utilizaremos estos mientras integramos con Supabase
const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 1, message: 'Pedido #45 listo para entregar', time: '2 min atrás', read: false, link: '/orders', type: 'order' },
  { id: 2, message: 'Inventario bajo: Tomates', time: '10 min atrás', read: false, link: '/inventory', type: 'inventory' },
  { id: 3, message: 'Nuevo pedido en Mesa 3', time: '15 min atrás', read: true, link: '/tables', type: 'table' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [messages, setMessages] = useState<{count: number}>({count: 2});
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Efecto para cargar las notificaciones al inicio
  useEffect(() => {
    console.log("Cargando notificaciones...");
    // Aquí se cargarían las notificaciones reales desde Supabase
    // Por ahora usamos las de muestra
  }, []);

  // Suscribirse a eventos en tiempo real de Supabase (órdenes e inventario)
  useEffect(() => {
    console.log("Configurando suscripciones a notificaciones en tiempo real");
    
    const orderChannel = supabase
      .channel('orders-notifications')
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders' 
          }, 
          payload => {
            console.log('Nueva notificación de orden:', payload);
            // Aquí procesaríamos la notificación real
          })
      .subscribe((status) => {
        console.log('Estado de suscripción a órdenes:', status);
      });
      
    const inventoryChannel = supabase
      .channel('inventory-notifications')
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'inventory_items' 
          }, 
          payload => {
            console.log('Nueva notificación de inventario:', payload);
            // Aquí procesaríamos la notificación real
          })
      .subscribe((status) => {
        console.log('Estado de suscripción a inventario:', status);
      });

    return () => {
      console.log("Limpiando suscripciones a notificaciones");
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(inventoryChannel);
    };
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Toggle dark class on document
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Función para marcar una notificación como leída
  const markAsRead = (id: number) => {
    console.log(`Marcando notificación ${id} como leída`);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Función para manejar el clic en una notificación
  const handleNotificationClick = (notification: Notification) => {
    console.log(`Notificación clickeada:`, notification);
    if (notification.link) {
      markAsRead(notification.id);
      setShowNotifications(false);
      navigate(notification.link);
      
      // Mostrar un toast informativo
      toast({
        title: "Navegando",
        description: `Redirigiendo a ${notification.link}`,
      });
    }
  };

  // Función para ver todas las notificaciones
  const viewAllNotifications = () => {
    console.log("Ver todas las notificaciones");
    setShowNotifications(false);
    navigate('/notifications');
    
    // Mostrar un toast informativo
    toast({
      title: "Notificaciones",
      description: "Visualizando todas las notificaciones",
    });
  };

  // Función para manejar click en mensajes
  const handleMessagesClick = () => {
    console.log("Abriendo mensajes");
    setShowMessages(!showMessages);
    
    // Reset del contador de mensajes
    if (messages.count > 0) {
      setMessages({count: 0});
      
      toast({
        title: "Mensajes",
        description: "No hay mensajes nuevos disponibles aún",
      });
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={cn(
      "bg-white dark:bg-gray-900 border-b border-border flex items-center justify-between",
      isMobile ? "h-14 px-2" : "h-16 px-4"
    )}>
      <div className="flex-1 ml-10 md:ml-0">
        <h1 className={cn(
          "font-medium truncate",
          isMobile ? "text-lg" : "text-xl"  
        )}>
          {user ? `Bienvenido, ${user.name}` : 'Restaurant OS'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Dark mode toggle */}
        <button 
          className="icon-button"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={isMobile ? 18 : 20} /> : <Moon size={isMobile ? 18 : 20} />}
        </button>
        
        {/* Chat button - hide on very small screens */}
        <button 
          className="icon-button relative hidden sm:flex"
          onClick={handleMessagesClick}
        >
          <MessageSquare size={isMobile ? 18 : 20} />
          {messages.count > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {messages.count}
            </span>
          )}
        </button>
        
        {/* Mensajes dropdown */}
        {showMessages && (
          <div className="absolute right-0 top-16 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg z-50 animate-scale-in">
            <div className="p-3 border-b border-border">
              <h3 className="font-medium">Mensajes</h3>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <p>No hay mensajes nuevos</p>
              <button 
                onClick={() => {
                  setShowMessages(false);
                  navigate('/messages');
                }}
                className="mt-2 text-primary text-sm hover:underline"
              >
                Ir al centro de mensajes
              </button>
            </div>
          </div>
        )}
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className="icon-button relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={isMobile ? 18 : 20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-16 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg z-50 animate-scale-in">
              <div className="p-3 border-b border-border">
                <h3 className="font-medium">Notificaciones</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={cn(
                        'p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer',
                        !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <p className={cn('text-sm', !notification.read && 'font-medium')}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No hay notificaciones
                  </div>
                )}
              </div>
              <div className="p-2 text-center border-t border-border">
                <button 
                  className="text-primary text-sm hover:underline"
                  onClick={viewAllNotifications}
                >
                  Ver todas
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User avatar */}
        {user && (
          <div className="relative group">
            <button className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline-block">{user.name}</span>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <div className="p-2">
                <button 
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
