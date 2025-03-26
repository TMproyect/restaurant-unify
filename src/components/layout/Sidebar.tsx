
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ShoppingCart, Users, Package, FileText, ChartBar, Settings, ArrowLeft, ArrowRight, Menu as MenuIcon, User, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserRole } from '@/contexts/auth/types';
import { useIsMobile } from '@/hooks/use-mobile';

// Define menu items with role permissions
interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  allowedRoles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: ChartBar,
    path: '/dashboard',
    allowedRoles: ['admin', 'manager', 'waiter', 'kitchen', 'delivery'],
  },
  {
    title: 'Pedidos',
    icon: ShoppingCart,
    path: '/orders',
    allowedRoles: ['admin', 'manager', 'waiter', 'kitchen', 'delivery'],
  },
  {
    title: 'Mesas',
    icon: Users,
    path: '/tables',
    allowedRoles: ['admin', 'manager', 'waiter'],
  },
  {
    title: 'Cocina',
    icon: Calendar,
    path: '/kitchen',
    allowedRoles: ['admin', 'manager', 'kitchen'],
  },
  {
    title: 'Menú',
    icon: Utensils,
    path: '/menu',
    allowedRoles: ['admin', 'manager', 'kitchen', 'waiter'],
  },
  {
    title: 'Inventario',
    icon: Package,
    path: '/inventory',
    allowedRoles: ['admin', 'manager', 'kitchen'],
  },
  {
    title: 'Informes',
    icon: FileText,
    path: '/reports',
    allowedRoles: ['admin', 'manager'],
  },
  {
    title: 'Personal',
    icon: User,
    path: '/staff',
    allowedRoles: ['admin', 'manager'],
  },
  {
    title: 'Configuración',
    icon: Settings,
    path: '/settings',
    allowedRoles: ['admin', 'manager'],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Close mobile menu when navigating
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => user && item.allowedRoles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Mobile menu button for small screens
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-3 left-3 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-md"
          aria-label="Menú principal"
        >
          <Menu size={24} />
        </button>
        
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-border transform transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="font-bold text-xl text-primary">RestaurantOS</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="icon-button"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.path}
                  className={cn(
                    'sidebar-item cursor-pointer',
                    location.pathname === item.path && 'active'
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </div>
              ))}
            </nav>
          </div>
          
          {user && (
            <div className="p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Conectado como: <span className="font-medium">{user.role}</span>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        'h-screen bg-white dark:bg-gray-900 border-r border-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-[72px]' : 'w-[250px]'
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="font-bold text-xl text-primary animate-fade-in">RestaurantOS</div>
        )}
        <button
          className="icon-button ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {filteredMenuItems.map((item) => (
            <div
              key={item.path}
              className={cn(
                'sidebar-item cursor-pointer',
                location.pathname === item.path && 'active'
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              {!collapsed && (
                <span className="animate-fade-in">{item.title}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {!collapsed && user && (
        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Conectado como: <span className="font-medium">{user.role}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
