
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
    console.log("🔴 Sidebar: No user found, not rendering sidebar");
    return null;
  }

  // Determine user's role access
  const isAdmin = user.role === "admin" || user.role === "propietario";
  const isManager = user.role === "gerente";
  const isWaiter = user.role === "mesero";
  const isKitchen = user.role === "cocina" || user.role === "kitchen";
  const isDelivery = user.role === "repartidor" || user.role === "delivery";

  console.log(`🔵 Sidebar: User role detected as '${user.role}'`);

  // Helper function to determine if a menu item should be shown based on role
  const shouldShowMenuItem = (allowedRoles: string[]): boolean => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role) || isAdmin;
  };

  return (
    <aside className="flex flex-col h-full overflow-y-auto">
      <div className="space-y-1.5 py-4">
        {/* Dashboard - accessible to all */}
        <NavItem
          to="/"
          icon={<Home />}
          label="Dashboard"
          onClick={closeMobileSidebar}
          active={location.pathname === "/" || location.pathname === "/dashboard"}
        />
        
        {/* Orders - accessible to all except kitchen */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente', 'mesero', 'repartidor', 'delivery']) && (
          <NavItem
            to="/orders"
            icon={<ClipboardList />}
            label="Órdenes"
            onClick={closeMobileSidebar}
            active={location.pathname === "/orders"}
          />
        )}
        
        {/* Kitchen - accessible to kitchen staff, admin, and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente', 'cocina', 'kitchen']) && (
          <NavItem
            to="/kitchen"
            icon={<ChefHat />}
            label="Cocina"
            onClick={closeMobileSidebar}
            active={location.pathname === "/kitchen"}
          />
        )}
        
        {/* Menu - accessible to all except delivery */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente', 'mesero', 'cocina', 'kitchen']) && (
          <NavItem
            to="/menu"
            icon={<Utensils />}
            label="Menú"
            onClick={closeMobileSidebar}
            active={location.pathname === "/menu"}
          />
        )}
        
        {/* Inventory - accessible to admin and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente']) && (
          <NavItem
            to="/inventory"
            icon={<ShoppingBag />}
            label="Inventario"
            onClick={closeMobileSidebar}
            active={location.pathname === "/inventory"}
          />
        )}
        
        {/* Tables - accessible to waiters, admin, and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente', 'mesero']) && (
          <NavItem
            to="/tables"
            icon={<LayoutGrid />}
            label="Mesas"
            onClick={closeMobileSidebar}
            active={location.pathname === "/tables"}
          />
        )}
        
        {/* Cashier - accessible to admin and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente']) && (
          <NavItem
            to="/cashier"
            icon={<CircleDollarSign />}
            label="Caja"
            onClick={closeMobileSidebar}
            active={location.pathname === "/cashier"}
          />
        )}
        
        {/* Delivery - accessible to delivery staff, admin, and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente', 'repartidor', 'delivery']) && (
          <NavItem
            to="/delivery"
            icon={<Truck />}
            label="Deliveries"
            onClick={closeMobileSidebar}
            active={location.pathname === "/delivery"}
          />
        )}
        
        {/* Sales - accessible to admin and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente']) && (
          <NavItem
            to="/sales"
            icon={<BarChart />}
            label="Ventas"
            onClick={closeMobileSidebar}
            active={location.pathname === "/sales"}
          />
        )}
        
        {/* Reports - accessible to admin and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente']) && (
          <NavItem
            to="/reports"
            icon={<FileText />}
            label="Reportes"
            onClick={closeMobileSidebar}
            active={location.pathname === "/reports"}
          />
        )}
        
        {/* Staff - accessible to admin and manager */}
        {isAdmin && (
          <NavItem
            to="/staff"
            icon={<Users />}
            label="Personal"
            onClick={closeMobileSidebar}
            active={location.pathname === "/staff"}
          />
        )}
        
        {/* Settings - accessible to admin and manager */}
        {shouldShowMenuItem(['admin', 'propietario', 'gerente']) && (
          <NavItem
            to="/settings"
            icon={<Settings />}
            label="Configuración"
            onClick={closeMobileSidebar}
            active={location.pathname.startsWith("/settings") || location.pathname === "/roles-and-permissions"}
          />
        )}
      </div>

      <div className="mt-auto border-t pt-4">
        {/* Notifications - accessible to all */}
        <NavItem
          to="/notifications"
          icon={<Bell />}
          label="Notificaciones"
          onClick={closeMobileSidebar}
          active={location.pathname === "/notifications"}
        />
        
        {/* Messages - accessible to all */}
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
