import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/AuthContext";
import { UserRole, Role, CustomRole } from "@/contexts/auth/types";
import { Edit, Plus, Search, Users, Shield, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RolePermissionsEditor from "./RolePermissionsEditor";
import { defaultPermissions, getDefaultRolePermissions, systemRoles } from "@/data/permissionsData";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCustomRoles, upsertCustomRole, getAuditLogs } from "@/utils/customDbOperations";
import { getRoleDisplayName } from "@/utils/formatUtils";

const NewRoleDialog = ({ onCreateRole }: { onCreateRole: (name: string, description: string, baseRole: UserRole) => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseRole, setBaseRole] = useState<UserRole>('mesero');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Nombre requerido",
        description: "Debe ingresar un nombre para el nuevo rol"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onCreateRole(name, description, baseRole);
      setOpen(false);
      setName('');
      setDescription('');
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el rol"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-1">
          <Plus size={16} /> Crear Rol Personalizado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Rol</DialogTitle>
          <DialogDescription>
            Define un nuevo rol personalizado para tu equipo
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Rol</Label>
            <Input
              id="name"
              placeholder="Ej: Recepcionista"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej: Personal encargado de recibir a los clientes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Basado en permisos de</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={baseRole}
              onChange={(e) => setBaseRole(e.target.value as UserRole)}
            >
              {Object.entries(systemRoles).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              El nuevo rol heredará los permisos iniciales del rol seleccionado. Podrás personalizarlos después.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Creando..." : "Crear Rol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RolesAndPermissions = () => {
  const { fetchAllUsers } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  
  React.useEffect(() => {
    const loadRolesAndUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await fetchAllUsers();
        
        let customRoles: Role[] = [];
        
        try {
          console.log("Cargando roles personalizados desde la base de datos...");
          const dbCustomRoles = await getCustomRoles();
          
          if (dbCustomRoles && dbCustomRoles.length > 0) {
            console.log("Roles personalizados obtenidos:", dbCustomRoles);
            customRoles = dbCustomRoles.map(role => ({
              name: role.name as UserRole,
              description: role.description,
              permissions: role.permissions,
              userCount: 0,
              isCustom: true
            }));
          } else {
            console.log("No se encontraron roles personalizados en la base de datos");
            const storedRoles = localStorage.getItem('customRoles');
            if (storedRoles) {
              console.log("Cargando roles desde localStorage");
              customRoles = JSON.parse(storedRoles);
            }
          }
        } catch (error) {
          console.error("Error al cargar roles personalizados:", error);
          const storedRoles = localStorage.getItem('customRoles');
          if (storedRoles) {
            console.log("Cargando roles desde localStorage debido a error");
            customRoles = JSON.parse(storedRoles);
          }
        }
        
        const roleCounts: Record<string, number> = {};
        allUsers.forEach(user => {
          roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        });
        
        console.log("Conteo de usuarios por rol:", roleCounts);
        
        const systemRolesArray: Role[] = Object.entries(systemRoles).map(
          ([roleName, label]) => ({
            name: roleName as UserRole,
            description: label,
            permissions: defaultPermissions.reduce((acc, permission) => {
              acc[permission.id] = permission.default[roleName as UserRole];
              return acc;
            }, {} as Record<string, boolean>),
            userCount: roleCounts[roleName] || 0,
            isSystem: true
          })
        );
        
        customRoles = customRoles.map(role => ({
          ...role,
          userCount: roleCounts[role.name as string] || 0
        }));
        
        const combinedRoles = [...systemRolesArray, ...customRoles];
        console.log("Roles combinados:", combinedRoles);
        setRoles(combinedRoles);
      } catch (error) {
        console.error("Error al cargar datos de roles y usuarios:", error);
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
  
  const handleSavePermissions = async (updatedRole: Role) => {
    if (updatedRole.isCustom) {
      try {
        const success = await upsertCustomRole({
          name: updatedRole.name,
          description: updatedRole.description,
          permissions: updatedRole.permissions
        });
        
        if (!success) {
          throw new Error("Failed to save custom role");
        }
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        const updatedCustomRoles = roles
          .filter(role => role.isCustom)
          .map(role => 
            role.name === updatedRole.name ? updatedRole : role
          );
          
        localStorage.setItem('customRoles', JSON.stringify(updatedCustomRoles));
      }
    }
    
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
  
  const handleCreateRole = async (name: string, description: string, baseRole: UserRole) => {
    const newRole: Role = {
      name: name as UserRole,
      description,
      permissions: getDefaultRolePermissions(baseRole),
      userCount: 0,
      isCustom: true
    };
    
    try {
      const success = await upsertCustomRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions
      });
      
      if (!success) {
        throw new Error("Failed to save custom role");
      }
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      const customRoles = roles.filter(role => role.isCustom);
      customRoles.push(newRole);
      localStorage.setItem('customRoles', JSON.stringify(customRoles));
    }
    
    setRoles(prevRoles => [...prevRoles, newRole]);
    
    toast({
      title: "Rol creado",
      description: `El rol '${name}' se ha creado correctamente`
    });
  };
  
  const handleDuplicateRole = (role: Role) => {
    const baseName = role.name.toString();
    const newName = `${baseName}_copia`;
    
    handleCreateRole(
      newName, 
      `Copia de ${role.description || role.name}`,
      role.name as UserRole
    );
  };
  
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    setShowAuditLog(true);
    
    try {
      const logs = await getAuditLogs();
      setAuditLogs(logs || []);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los registros de auditoría"
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const filteredRoles = searchTerm
    ? roles.filter(role => 
        role.name.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : roles;

  if (!editingRole && !showAuditLog) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Roles y Permisos</CardTitle>
          <CardDescription>
            Define qué acciones puede realizar cada tipo de usuario dentro del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center w-full sm:w-auto space-x-2 border rounded-md px-3 py-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2 w-full sm:w-auto justify-end">
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={loadAuditLogs}
              >
                <Shield size={16} /> Historial de Cambios
              </Button>
              
              <NewRoleDialog onCreateRole={handleCreateRole} />
            </div>
          </div>
          
          <Alert className="mb-6">
            <Users className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Los roles del sistema no pueden ser eliminados. Los permisos críticos para roles administrativos están protegidos para evitar pérdida de acceso.
            </AlertDescription>
          </Alert>

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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No se encontraron roles que coincidan con "{searchTerm}"
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.name}>
                      <TableCell className="font-medium capitalize">
                        {getRoleDisplayName(role.name.toString())}
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.userCount}</TableCell>
                      <TableCell>
                        {role.isSystem ? (
                          <Badge variant="secondary">Sistema</Badge>
                        ) : (
                          <Badge variant="outline">Personalizado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit size={14} /> Editar Permisos
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleDuplicateRole(role)}
                          >
                            <Copy size={14} /> Duplicar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }
  
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Cambios en Permisos</CardTitle>
          <CardDescription>
            Registro de todas las modificaciones realizadas a los roles y permisos
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => setShowAuditLog(false)}>
          Volver a Roles
        </Button>
      </CardHeader>
      <CardContent>
        {auditLoading ? (
          <div className="flex justify-center items-center py-8">
            <p>Cargando registros de auditoría...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No hay registros de auditoría disponibles
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol Modificado</TableHead>
                <TableHead>Permiso</TableHead>
                <TableHead>Cambio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.user_name}</TableCell>
                  <TableCell className="capitalize">{getRoleDisplayName(log.role_name)}</TableCell>
                  <TableCell>{log.permission_name}</TableCell>
                  <TableCell>
                    <span className={log.new_value ? 'text-green-600' : 'text-red-600'}>
                      {log.new_value ? 'Activado' : 'Desactivado'}
                    </span>
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
