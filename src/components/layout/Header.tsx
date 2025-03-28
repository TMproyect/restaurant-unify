
import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, MessageSquare, X, AlertCircle, Package, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOnClickOutside } from '@/hooks/use-click-outside';
import { getNotifications, markNotificationAsRead, Notification } from '@/services/notificationService';
import { getUnreadMessagesCount } from '@/services/messageService';

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

const Header = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const messagesRef = React.useRef<HTMLDivElement>(null);
  
  // Close dropdowns when clicking outside
  useOnClickOutside(notificationsRef, () => setShowNotifications(false));
  useOnClickOutside(messagesRef, () => setShowMessages(false));

  // Fetch notifications and unread counts when component mounts
  useEffect(() => {
    if (user) {
      console.log("Loading notifications and message counts");
      loadNotifications();
      loadUnreadMessageCount();

      // Subscribe to notifications and messages
      const notificationsChannel = supabase
        .channel('notifications-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications' 
          }, 
          payload => {
            console.log('New notification event:', payload);
            loadNotifications();
          })
        .subscribe((status) => {
          console.log('Notifications subscription status:', status);
        });

      const messagesChannel = supabase
        .channel('messages-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages' 
          }, 
          payload => {
            console.log('New message event:', payload);
            loadUnreadMessageCount();
          })
        .subscribe((status) => {
          console.log('Messages subscription status:', status);
        });

      return () => {
        console.log("Cleaning up subscriptions");
        supabase.removeChannel(notificationsChannel);
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadNotifications(data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const loadUnreadMessageCount = async () => {
    if (!user) return;

    try {
      const count = await getUnreadMessagesCount(user.id);
      setUnreadMessages(count);
    } catch (error) {
      console.error("Error loading unread message count:", error);
    }
  };
  
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

  // Function to mark a notification as read
  const handleNotificationClick = async (notification: Notification) => {
    console.log(`Notification clicked:`, notification);
    try {
      // If the notification has not been read yet, mark it as read
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }
      
      // Close notification dropdown
      setShowNotifications(false);
      
      // Navigate to the link if provided
      if (notification.link) {
        console.log(`Navigating to ${notification.link}`);
        navigate(notification.link);
        
        toast({
          title: "Navegando",
          description: `Redirigiendo a ${notification.link}`,
        });
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Function to view all notifications
  const viewAllNotifications = () => {
    console.log("View all notifications clicked");
    setShowNotifications(false);
    navigate('/notifications');
    
    toast({
      title: "Notificaciones",
      description: "Visualizando todas las notificaciones",
    });
  };

  // Function to handle click on messages
  const handleMessagesClick = () => {
    console.log("Messages clicked");
    
    // Close notifications dropdown if open
    if (showNotifications) {
      setShowNotifications(false);
    }
    
    // Toggle messages dropdown
    setShowMessages(!showMessages);
    
    // If dropdown is being opened and there are unread messages, navigate to messages page
    if (!showMessages && unreadMessages > 0) {
      setShowMessages(false); // Close dropdown
      navigate('/messages'); // Navigate to messages page
      
      toast({
        title: "Mensajes",
        description: "Navigando a mensajes",
      });
    }
  };

  // Function to navigate to messages page
  const goToMessages = () => {
    console.log("Navigating to messages page");
    setShowMessages(false);
    navigate('/messages');
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    // Close messages dropdown if open
    if (showMessages) {
      setShowMessages(false);
    }
    
    // Toggle notifications dropdown
    setShowNotifications(!showNotifications);
  };

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
        <div className="relative" ref={messagesRef}>
          <button 
            className="icon-button relative hidden sm:flex"
            onClick={handleMessagesClick}
            aria-label="Messages"
          >
            <MessageSquare size={isMobile ? 18 : 20} />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
          
          {/* Messages dropdown */}
          {showMessages && (
            <div className="absolute right-0 top-16 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg z-50 animate-scale-in">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-medium">Mensajes</h3>
                <button 
                  onClick={() => setShowMessages(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-8 text-center text-muted-foreground">
                <p>No hay mensajes nuevos</p>
                <button 
                  onClick={goToMessages}
                  className="mt-2 text-primary text-sm hover:underline"
                >
                  Ir al centro de mensajes
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="icon-button relative"
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <Bell size={isMobile ? 18 : 20} />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-16 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg z-50 animate-scale-in">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-medium">Notificaciones</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(notification => (
                    <div 
                      key={notification.id}
                      className={cn(
                        'p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer',
                        !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className={cn('text-sm', !notification.read && 'font-medium')}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                              {new Date(notification.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                        </div>
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
