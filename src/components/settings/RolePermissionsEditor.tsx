
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save, RotateCcw } from "lucide-react";
import { Role } from "@/contexts/auth/types";
import { defaultPermissions } from "@/data/permissionsData";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { PermissionCategory } from "@/contexts/auth/types";
import { useAuth } from "@/contexts/auth/AuthContext";
import { getSystemSetting, logPermissionChange } from "@/utils/customDbOperations";
import PermissionSearch from "./permissions/PermissionSearch";
import PermissionsList from "./permissions/PermissionsList";

interface RolePermissionsEditorProps {
  role: Role;
  onSave: (updatedRole: Role) => void;
  onCancel: () => void;
}

const RolePermissionsEditor: React.FC<RolePermissionsEditorProps> = ({
  role,
  onSave,
  onCancel
}) => {
  const [editedRole, setEditedRole] = useState<Role>({ ...role });
  const [description, setDescription] = useState(role.description);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const [auditingEnabled, setAuditingEnabled] = useState(false);
  
  // Check if auditing should be enabled
  useEffect(() => {
    const checkAuditingConfig = async () => {
      try {
        const value = await getSystemSetting('enable_audit_logging');
        if (value === 'true') {
          setAuditingEnabled(true);
        }
      } catch (error) {
        console.log('Error checking audit config:', error);
      }
    };
    
    checkAuditingConfig();
  }, []);
  
  const handleTogglePermission = (permissionId: string) => {
    // Get the current value for this permission
    const currentValue = editedRole.permissions[permissionId] || false;
    const newValue = !currentValue;
    
    // Handle critical admin self-lockout prevention
    if (
      permissionId === 'settings.roles' && 
      !newValue && 
      (role.name === 'admin' || role.name === 'propietario') &&
      user?.role === role.name
    ) {
      // Check if there are other admins with this permission
      checkAdminLockout(permissionId, () => {
        // Safe to toggle since other admins have this permission
        updatePermission(permissionId, newValue);
      });
    } else {
      // No risk of lockout, proceed with update
      updatePermission(permissionId, newValue);
    }
  };
  
  // Log permission change to audit trail
  const logPermissionAudit = async (permissionId: string, previousValue: boolean, newValue: boolean) => {
    if (!auditingEnabled || !user) return;
    
    try {
      const permissionInfo = defaultPermissions.find(p => p.id === permissionId);
      
      await logPermissionChange(
        user.id,
        user.name,
        role.name,
        permissionId,
        permissionInfo?.name || permissionId,
        previousValue,
        newValue
      );
      
      console.log('Logged permission change to audit trail');
    } catch (error) {
      console.error('Failed to log permission change:', error);
    }
  };
  
  const checkAdminLockout = (permissionId: string, onSafe: () => void) => {
    // This would be an async operation in a real scenario checking other admin users
    // For now, prevent removal of critical admin permissions
    toast({
      variant: "destructive",
      title: "Acción bloqueada - Prevención de auto-bloqueo",
      description: "No puedes quitar este permiso porque podrías perder acceso al sistema de roles. Debe existir al menos un usuario con este permiso.",
      duration: 5000
    });
    
    // In a real implementation, we would check if other admins have this permission
    // and only call onSafe() if it's safe to proceed
  };
  
  const updatePermission = (permissionId: string, newValue: boolean) => {
    const previousValue = editedRole.permissions[permissionId] || false;
    
    setEditedRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: newValue
      }
    }));
    
    // Log the change to audit trail if enabled
    if (auditingEnabled) {
      logPermissionAudit(permissionId, previousValue, newValue);
    }
  };
  
  const handleSave = () => {
    // Prevent removing critical permissions for admin
    if (editedRole.name === 'admin' || editedRole.name === 'propietario') {
      const hasSettingsAccess = editedRole.permissions['settings.access'];
      const hasRolesAccess = editedRole.permissions['settings.roles'];
      
      if (!hasSettingsAccess || !hasRolesAccess) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pueden quitar permisos críticos al rol de Administrador/Propietario"
        });
        return;
      }
    }
    
    const updatedRole = {
      ...editedRole,
      description
    };
    
    onSave(updatedRole);
  };
  
  const handleReset = () => {
    // Reset to default permissions for this role
    const resetPermissions = defaultPermissions.reduce((acc, permission) => {
      acc[permission.id] = permission.default[role.name];
      return acc;
    }, {} as Record<string, boolean>);
    
    setEditedRole({
      ...role,
      permissions: resetPermissions
    });
    
    setDescription(role.description);
    
    toast({
      title: "Permisos restablecidos",
      description: "Los permisos se han restablecido a los valores predeterminados"
    });
  };
  
  // Filter permissions based on search term
  const filteredPermissions = searchTerm
    ? defaultPermissions.filter(permission => 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : defaultPermissions;
  
  // Group filtered permissions by category
  const permissionsByCategory = filteredPermissions.reduce((groups, permission) => {
    if (!groups[permission.category]) {
      groups[permission.category] = [];
    }
    groups[permission.category].push(permission);
    return groups;
  }, {} as Record<PermissionCategory, typeof defaultPermissions>);
  
  const isCriticalUser = user?.role === role.name && 
    (role.name === 'admin' || role.name === 'propietario');
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" onClick={onCancel} className="mr-2 p-0 h-8 w-8">
            <ChevronLeft />
          </Button>
          <CardTitle className="flex items-center">
            Editando Permisos para: <span className="capitalize ml-1">{role.name}</span>
            {role.isSystem && (
              <Badge variant="outline" className="ml-2">Rol del Sistema</Badge>
            )}
          </CardTitle>
        </div>
        <CardDescription>
          Personaliza qué acciones puede realizar este rol en el sistema.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="role-description">Descripción del Rol</Label>
          <Textarea 
            id="role-description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe las responsabilidades de este rol"
            className="mt-1"
          />
        </div>
        
        <PermissionSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <PermissionsList 
          permissionsByCategory={permissionsByCategory}
          currentPermissions={editedRole.permissions}
          isCriticalUser={isCriticalUser}
          userRole={role.name}
          onTogglePermission={handleTogglePermission}
          searchTerm={searchTerm}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-1">
          <RotateCcw size={14} /> Restablecer Predeterminados
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-1">
            <Save size={14} /> Guardar Cambios
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RolePermissionsEditor;
