
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, RotateCcw, HelpCircle } from "lucide-react";
import { Role } from "@/contexts/auth/types";
import { defaultPermissions } from "@/data/permissionsData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { PermissionCategory } from "@/contexts/auth/types";

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
  const { toast } = useToast();
  
  const handleTogglePermission = (permissionId: string) => {
    setEditedRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: !prev.permissions[permissionId]
      }
    }));
  };
  
  const handleSave = () => {
    // Prevent removing critical permissions for admin
    if (editedRole.name === 'admin' || editedRole.name === 'owner') {
      const hasSettingsAccess = editedRole.permissions['settings.access'];
      const hasRolesAccess = editedRole.permissions['settings.roles'];
      
      if (!hasSettingsAccess || !hasRolesAccess) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pueden quitar permisos críticos al rol de Administrador/Dueño"
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
  
  // Group permissions by category
  const permissionsByCategory = defaultPermissions.reduce((groups, permission) => {
    if (!groups[permission.category]) {
      groups[permission.category] = [];
    }
    groups[permission.category].push(permission);
    return groups;
  }, {} as Record<PermissionCategory, typeof defaultPermissions>);
  
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" onClick={onCancel} className="mr-2 p-0 h-8 w-8">
            <ChevronLeft />
          </Button>
          <CardTitle>Editando Permisos para: <span className="capitalize">{role.name}</span></CardTitle>
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
        
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium">Módulo: {formatCategoryName(category)}</h3>
            <div className="space-y-4">
              {permissions.map(permission => (
                <div key={permission.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`perm-${permission.id}`}
                      checked={editedRole.permissions[permission.id] || false}
                      onCheckedChange={() => handleTogglePermission(permission.id)}
                    />
                    <div className="space-y-0.5">
                      <Label 
                        htmlFor={`perm-${permission.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      {permission.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                <HelpCircle size={12} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{permission.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
          </div>
        ))}
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
