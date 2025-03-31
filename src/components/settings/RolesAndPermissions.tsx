
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth/AuthContext";
import { UserRole, Role } from "@/contexts/auth/types";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RolePermissionsEditor from "./RolePermissionsEditor";
import { defaultPermissions } from "@/data/permissionsData";

// Define role descriptions and default values
const roleDescriptions: Record<UserRole, string> = {
  admin: "Acceso completo y configuración del sistema",
  manager: "Supervisión operativa y gestión de personal",
  waiter: "Toma de pedidos y servicio en mesa",
  kitchen: "Visualización y gestión de comandas",
  delivery: "Gestión de pedidos para llevar/entrega",
  owner: "Propietario del negocio con acceso total",
};

const RolesAndPermissions = () => {
  const { fetchAllUsers } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Load roles and user counts
  React.useEffect(() => {
    const loadRolesAndUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await fetchAllUsers();
        
        // Count users per role
        const roleCounts: Record<string, number> = {};
        allUsers.forEach(user => {
          roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        });
        
        // Create roles array
        const rolesArray: Role[] = Object.entries(roleDescriptions).map(
          ([roleName, description]) => ({
            name: roleName as UserRole,
            description,
            permissions: defaultPermissions.reduce((acc, permission) => {
              acc[permission.id] = permission.default[roleName as UserRole];
              return acc;
            }, {} as Record<string, boolean>),
            userCount: roleCounts[roleName] || 0
          })
        );
        
        setRoles(rolesArray);
      } catch (error) {
        console.error("Error loading roles data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos de roles y usuarios"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRolesAndUsers();
  }, [fetchAllUsers, toast]);
  
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
  };
  
  const handleSavePermissions = (updatedRole: Role) => {
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.name === updatedRole.name ? updatedRole : role
      )
    );
    
    toast({
      title: "Permisos actualizados",
      description: `Los permisos para el rol '${updatedRole.name}' se han actualizado correctamente`,
    });
    
    setEditingRole(null);
  };

  if (editingRole) {
    return (
      <RolePermissionsEditor
        role={editingRole}
        onSave={handleSavePermissions}
        onCancel={() => setEditingRole(null)}
      />
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Roles y Permisos</CardTitle>
        <CardDescription>
          Define qué acciones puede realizar cada tipo de usuario dentro de RestaurantOS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <p>Cargando roles...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Rol</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.name}>
                  <TableCell className="font-medium capitalize">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.userCount}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit size={14} /> Editar Permisos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesAndPermissions;
