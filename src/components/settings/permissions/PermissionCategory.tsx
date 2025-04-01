
import React from "react";
import { Separator } from "@/components/ui/separator";
import PermissionItem from "./PermissionItem";
import { Permission } from "@/contexts/auth/types";
import { normalizeRoleName, getRoleDisplayName } from "@/utils/formatUtils";

interface PermissionCategoryProps {
  categoryName: string;
  displayName: string;
  permissions: Permission[];
  currentPermissions: Record<string, boolean>;
  isCriticalUser: boolean;
  userRole: string | undefined;
  onTogglePermission: (permissionId: string) => void;
}

const PermissionCategory: React.FC<PermissionCategoryProps> = ({
  categoryName,
  displayName,
  permissions,
  currentPermissions,
  isCriticalUser,
  userRole,
  onTogglePermission
}) => {
  if (permissions.length === 0) {
    return null;
  }
  
  // Normalizar el userRole para asegurar consistencia
  const normalizedUserRole = userRole ? normalizeRoleName(userRole) : undefined;
  
  return (
    <div key={categoryName} className="space-y-3">
      <h3 className="text-lg font-medium">Módulo: {displayName}</h3>
      <div className="space-y-4">
        {permissions.map(permission => {
          // Check if this is a critical permission for this role
          const isCriticalPermission = 
            (permission.id === 'settings.roles' || permission.id === 'settings.access') && 
            (normalizedUserRole === 'admin' || normalizedUserRole === 'propietario') &&
            isCriticalUser;
          
          return (
            <PermissionItem
              key={permission.id}
              id={permission.id}
              name={permission.name}
              description={permission.description}
              isChecked={!!currentPermissions[permission.id]}
              isCriticalPermission={isCriticalPermission}
              onChange={() => onTogglePermission(permission.id)}
            />
          );
        })}
      </div>
      <Separator className="my-4" />
    </div>
  );
};

export default PermissionCategory;
