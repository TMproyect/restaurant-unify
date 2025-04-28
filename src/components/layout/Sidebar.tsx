
import React from 'react';
import {
  Home,
  Settings,
  Menu,
  Utensils,
  Bell,
  Users,
  Shield,
  BarChart,
  Store,
  ShoppingCart,
  Clock,
  LayoutGrid,
  ChefHat
} from 'lucide-react';
import { NavList } from './NavList';
import { NavItem } from './NavItem';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';

const Sidebar = () => {
  const { user } = useAuth();
  const { isAdmin, isManager } = usePermissions();
  
  const navigationItems = [
    {
      title: "Inicio",
      icon: <Home className="h-4 w-4" />,
      href: "/dashboard",
    },
    {
      title: "Órdenes",
      icon: <ShoppingCart className="h-4 w-4" />,
      href: "/orders",
    },
    {
      title: "Menú",
      icon: <Menu className="h-4 w-4" />,
      href: "/menu",
    },
    {
      title: "Mesas",
      icon: <Utensils className="h-4 w-4" />,
      href: "/tables",
    },
    {
      title: "Cocina",
      icon: <ChefHat className="h-4 w-4" />,
      href: "/kitchen",
      permission: "kitchen.view"
    },
    {
      title: "Notificaciones",
      icon: <Bell className="h-4 w-4" />,
      href: "/notifications",
    },
    {
      title: "Inventario",
      icon: <Store className="h-4 w-4" />,
      href: "/inventory",
      permission: "inventory.access"
    },
    {
      title: "Reportes",
      icon: <BarChart className="h-4 w-4" />,
      href: "/reports",
      permission: "reports.access"
    },
    {
      title: "Personal",
      icon: <Users className="h-4 w-4" />,
      href: "/staff",
      permission: "staff.view"
    },
    {
      title: "Integraciones",
      icon: <LayoutGrid className="h-4 w-4" />,
      href: "/integrations",
    },
    {
      title: "Ajustes",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
      permission: "settings.access"
    }
  ].filter(item => {
    if (item.permission) {
      return user?.role === 'admin' || user?.role === 'propietario' || 
             (isManager && item.permission !== 'settings.roles') ||
             item.permission === 'kitchen.view'; // Allow kitchen view for kitchen staff
    }
    return true;
  });
  
  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-4">
        <h1 className="text-lg font-bold">Panel de Administración</h1>
      </div>
      <NavList className="mt-6">
        {navigationItems.map((item) => (
          <NavItem
            key={item.title}
            href={item.href}
            icon={item.icon}
            permission={item.permission}
          >
            {item.title}
          </NavItem>
        ))}
      </NavList>
    </div>
  );
};

export default Sidebar;
