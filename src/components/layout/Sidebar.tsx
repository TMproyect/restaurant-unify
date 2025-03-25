
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ShoppingCart, Users, Package, FileText, ChartBar, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/contexts/AuthContext';

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
    title: 'Configuración',
    icon: Settings,
    path: '/settings',
    allowedRoles: ['admin', 'manager'],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => user && item.allowedRoles.includes(user.role)
  );

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
