
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/contexts/auth/types";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { systemRoles } from "@/data/permissionsData";

interface NewRoleDialogProps {
  onCreateRole: (name: string, description: string, baseRole: UserRole) => void;
}

const NewRoleDialog: React.FC<NewRoleDialogProps> = ({ onCreateRole }) => {
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

export default NewRoleDialog;
