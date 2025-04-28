
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Clock, UserCheck, XCircle } from "lucide-react";
import { assignTemporaryRole, getAllTemporaryRoles, removeTemporaryRole } from "@/utils/temporaryRolesCache";
import { UserRole } from "@/contexts/auth/types";
import { systemRoles } from "@/data/permissionsData";
import { useAuth } from "@/contexts/auth/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const TemporaryRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [duration, setDuration] = useState<number>(60); // minutes
  const [temporaryRoles, setTemporaryRoles] = useState<Record<string, { role: UserRole, expiresAt: Date }>>({});
  const { toast } = useToast();
  const { fetchAllUsers } = useAuth();

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await fetchAllUsers();
        setUsers(allUsers || []);
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar usuarios",
          description: "No se pudieron cargar los usuarios."
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [fetchAllUsers, toast]);

  // Load current temporary roles
  useEffect(() => {
    const updateTemporaryRoles = () => {
      setTemporaryRoles(getAllTemporaryRoles());
    };
    
    // Initial load
    updateTemporaryRoles();
    
    // Update every 30 seconds
    const interval = setInterval(updateTemporaryRoles, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole || !duration) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios"
      });
      return;
    }
    
    try {
      assignTemporaryRole(selectedUserId, selectedRole, duration);
      setTemporaryRoles(getAllTemporaryRoles());
      
      // Find user name for toast
      const user = users.find(u => u.id === selectedUserId);
      
      toast({
        title: "Rol temporal asignado",
        description: `${user?.name || 'Usuario'} ahora tiene el rol temporal de ${systemRoles[selectedRole] || selectedRole} por ${duration} minutos`
      });
    } catch (error) {
      console.error("Error assigning temporary role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo asignar el rol temporal"
      });
    }
  };

  const handleRevokeRole = (userId: string) => {
    try {
      removeTemporaryRole(userId);
      setTemporaryRoles(getAllTemporaryRoles());
      
      // Find user name for toast
      const user = users.find(u => u.id === userId);
      
      toast({
        title: "Rol temporal revocado",
        description: `El rol temporal de ${user?.name || 'Usuario'} ha sido revocado`
      });
    } catch (error) {
      console.error("Error revoking temporary role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo revocar el rol temporal"
      });
    }
  };

  const getRemainingTime = (expiresAt: Date): string => {
    return formatDistanceToNow(expiresAt, {
      addSuffix: true,
      locale: es
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Gestión de Roles Temporales
        </CardTitle>
        <CardDescription>
          Asigna roles temporales a los usuarios del sistema por un tiempo limitado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Usuario</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={loading}
                >
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {systemRoles[user.role] || user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol temporal</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(systemRoles).map(([role, displayName]) => (
                      <SelectItem key={role} value={role}>
                        {displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={1440}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                />
              </div>

              <Button 
                onClick={handleAssignRole} 
                disabled={loading || !selectedUserId}
                type="button"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" /> Asignar Rol Temporal
                  </>
                )}
              </Button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Roles temporales activos</h3>
            {Object.keys(temporaryRoles).length === 0 ? (
              <p className="text-muted-foreground">No hay roles temporales activos</p>
            ) : (
              <ul className="space-y-4">
                {Object.entries(temporaryRoles).map(([userId, { role, expiresAt }]) => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <li key={userId} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user?.name || 'Usuario desconocido'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge>{systemRoles[role] || role}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Expira {getRemainingTime(expiresAt)}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-muted-foreground">
                            {format(expiresAt, "dd/MM/yyyy HH:mm:ss")}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRevokeRole(userId)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t p-3">
        <p className="text-xs text-muted-foreground">
          Los roles temporales tienen prioridad sobre los roles permanentes y caducan automáticamente 
          después del tiempo especificado.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TemporaryRoleManager;
