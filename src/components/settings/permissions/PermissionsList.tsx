
import React from "react";
import { Permission, PermissionCategory as PermCategoryType } from "@/contexts/auth/types";
import PermissionCategory from "./PermissionCategory";

interface PermissionsListProps {
  permissionsByCategory: Record<PermCategoryType, Permission[]>;
  currentPermissions: Record<string, boolean>;
  isCriticalUser: boolean;
  userRole: string | undefined;
  onTogglePermission: (permissionId: string) => void;
  searchTerm: string;
}

const PermissionsList: React.FC<PermissionsListProps> = ({
  permissionsByCategory,
  currentPermissions,
  isCriticalUser,
  userRole,
  onTogglePermission,
  searchTerm
}) => {
  // Format category name for display
  const formatCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      dashboard: "Acceso y Dashboard", 
      orders: "Pedidos",
      tables: "Mesas", 
      kitchen: "Cocina", 
      cashier: "Caja", 
      inventory: "Inventario", 
      reports: "Informes", 
      staff: "Personal", 
      settings: "Configuración"
    };
    
    return categoryNames[category] || category;
  };
  
  return (
    <div className="space-y-4">
      {searchTerm && Object.keys(permissionsByCategory).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron permisos que coincidan con "{searchTerm}"
        </div>
      )}
      
      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
        <PermissionCategory 
          key={category}
          categoryName={category}
          displayName={formatCategoryName(category)}
          permissions={permissions}
          currentPermissions={currentPermissions}
          isCriticalUser={isCriticalUser}
          userRole={userRole}
          onTogglePermission={onTogglePermission}
        />
      ))}
    </div>
  );
};

export default PermissionsList;
