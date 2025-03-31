
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Role } from "@/contexts/auth/types";
import { Shield, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RolePermissionsEditor from "./RolePermissionsEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuditLogs } from "@/utils/customDbOperations";
import { getSystemSetting } from "@/utils/customDbOperations";
import NewRoleDialog from "./NewRoleDialog";
import RolesList from "./RolesList";
import RolesSearch from "./RolesSearch";
import AuditLogView from "./AuditLogView";
import { useRoles } from "@/hooks/use-roles";

const RolesAndPermissions = () => {
  const { 
    roles, 
    isLoading, 
    handleSavePermissions, 
    handleCreateRole, 
    handleDuplicateRole 
  } = useRoles();
  const { toast } = useToast();
  
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
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
  
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
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
            <RolesSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            
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
            <RolesList 
              filteredRoles={filteredRoles}
              searchTerm={searchTerm}
              onEditRole={handleEditRole}
              onDuplicateRole={handleDuplicateRole}
            />
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
    <AuditLogView 
      auditLogs={auditLogs}
      auditLoading={auditLoading}
      onBack={() => setShowAuditLog(false)}
    />
  );
};

export default RolesAndPermissions;
