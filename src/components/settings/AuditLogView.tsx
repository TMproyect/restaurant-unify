
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RolePermissionAuditLog } from "@/contexts/auth/types";
import { getRoleDisplayName } from "@/utils/formatUtils";

interface AuditLogViewProps {
  auditLogs: RolePermissionAuditLog[];
  auditLoading: boolean;
  onBack: () => void;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  auditLoading,
  onBack
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Cambios en Permisos</CardTitle>
          <CardDescription>
            Registro de todas las modificaciones realizadas a los roles y permisos
          </CardDescription>
        </div>
        <Button variant="outline" onClick={onBack}>
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

export default AuditLogView;
