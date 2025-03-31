
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Settings,
  Utensils,
  ShoppingBag,
  Users,
  Truck,
  BarChart,
  ClipboardList,
  ChefHat,
  MessageSquare,
  Bell,
  LayoutGrid,
  CircleDollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
          "hover:bg-primary/10 dark:hover:bg-primary/20",
          isActive || active
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "text-muted-foreground"
        )
      }
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

interface SidebarProps {
  sidebarCollapsed?: boolean;
  closeMobileSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarCollapsed = false,
  closeMobileSidebar,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin" || user.role === "owner";

  return (
    <aside className="flex flex-col h-full">
      <div className="space-y-1.5 py-4">
        <NavItem
          to="/dashboard"
          icon={<Home />}
          label="Dashboard"
          onClick={closeMobileSidebar}
          active={location.pathname === "/dashboard"}
        />
        <NavItem
          to="/orders"
          icon={<ClipboardList />}
          label="Órdenes"
          onClick={closeMobileSidebar}
          active={location.pathname === "/orders"}
        />
        <NavItem
          to="/kitchen"
          icon={<ChefHat />}
          label="Cocina"
          onClick={closeMobileSidebar}
          active={location.pathname === "/kitchen"}
        />
        <NavItem
          to="/menu"
          icon={<Utensils />}
          label="Menú"
          onClick={closeMobileSidebar}
          active={location.pathname === "/menu"}
        />
        <NavItem
          to="/inventory"
          icon={<ShoppingBag />}
          label="Inventario"
          onClick={closeMobileSidebar}
          active={location.pathname === "/inventory"}
        />
        <NavItem
          to="/tables"
          icon={<LayoutGrid />}
          label="Mesas"
          onClick={closeMobileSidebar}
          active={location.pathname === "/tables"}
        />
        <NavItem
          to="/cashier"
          icon={<CircleDollarSign />}
          label="Caja"
          onClick={closeMobileSidebar}
          active={location.pathname === "/cashier"}
        />
        <NavItem
          to="/delivery"
          icon={<Truck />}
          label="Deliveries"
          onClick={closeMobileSidebar}
          active={location.pathname === "/delivery"}
        />
        <NavItem
          to="/sales"
          icon={<BarChart />}
          label="Ventas"
          onClick={closeMobileSidebar}
          active={location.pathname === "/sales"}
        />
        <NavItem
          to="/reports"
          icon={<FileText />}
          label="Reportes"
          onClick={closeMobileSidebar}
          active={location.pathname === "/reports"}
        />
        
        {isAdmin && (
          <NavItem
            to="/staff"
            icon={<Users />}
            label="Personal"
            onClick={closeMobileSidebar}
            active={location.pathname === "/staff"}
          />
        )}
        <NavItem
          to="/settings"
          icon={<Settings />}
          label="Configuración"
          onClick={closeMobileSidebar}
          active={location.pathname === "/settings" || location.pathname === "/roles-and-permissions"}
        />
      </div>

      <div className="mt-auto border-t pt-4">
        <NavItem
          to="/notifications"
          icon={<Bell />}
          label="Notificaciones"
          onClick={closeMobileSidebar}
          active={location.pathname === "/notifications"}
        />
        <NavItem
          to="/messages"
          icon={<MessageSquare />}
          label="Mensajes"
          onClick={closeMobileSidebar}
          active={location.pathname === "/messages"}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
