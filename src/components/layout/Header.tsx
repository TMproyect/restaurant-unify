
import React, { useState } from 'react';
import { Bell, Moon, Sun, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample notifications for demo
const SAMPLE_NOTIFICATIONS = [
  { id: 1, message: 'Pedido #45 listo para entregar', time: '2 min atrás', read: false },
  { id: 2, message: 'Inventario bajo: Tomates', time: '10 min atrás', read: false },
  { id: 3, message: 'Nuevo pedido en Mesa 3', time: '15 min atrás', read: true },
];

const Header = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  
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

  // Count unread notifications
  const unreadCount = SAMPLE_NOTIFICATIONS.filter(n => !n.read).length;

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
        <button className="icon-button relative hidden sm:flex">
          <MessageSquare size={isMobile ? 18 : 20} />
          <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </button>
        
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
            <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg z-50 animate-scale-in">
              <div className="p-3 border-b border-border">
                <h3 className="font-medium">Notificaciones</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {SAMPLE_NOTIFICATIONS.map(notification => (
                  <div 
                    key={notification.id}
                    className={cn(
                      'p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer',
                      !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <p className={cn('text-sm', !notification.read && 'font-medium')}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center">
                <button className="text-primary text-sm">
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
