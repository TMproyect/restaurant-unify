
import React from "react";
import { Role } from "@/contexts/auth/types";
import { Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRoleDisplayName } from "@/utils/formatUtils";

interface RolesListProps {
  filteredRoles: Role[];
  searchTerm: string;
  onEditRole: (role: Role) => void;
  onDuplicateRole: (role: Role) => void;
}

const RolesList: React.FC<RolesListProps> = ({ 
  filteredRoles,
  searchTerm,
  onEditRole,
  onDuplicateRole
}) => {
  return (
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
                    onClick={() => onEditRole(role)}
                  >
                    <Edit size={14} /> Editar Permisos
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => onDuplicateRole(role)}
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
  );
};

export default RolesList;
