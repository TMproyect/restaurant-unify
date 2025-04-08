
import React, { useState } from 'react';
import { deleteMenuItem } from '@/services/menu/menuItemService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteConfirmProps = {
  id: string;
  isOpen: boolean;
  onClose: (success: boolean) => void;
};

// Componente de confirmación de eliminación
export const DeleteConfirmDialog: React.FC<DeleteConfirmProps> = ({ id, isOpen, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForceDelete, setShowForceDelete] = useState(false);

  const handleDelete = async (force: boolean = false) => {
    setIsDeleting(true);
    try {
      const success = await deleteMenuItem(id, force);
      
      if (!success && !force) {
        // Si falla sin forzar, mostrar opción para forzar eliminación
        setShowForceDelete(true);
        setIsDeleting(false);
        return;
      }
      
      if (success) {
        toast.success("Elemento eliminado con éxito");
        // Disparar evento para actualizar la lista
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        onClose(true);
      } else {
        toast.error("No se pudo eliminar el elemento");
        onClose(false);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el elemento");
      onClose(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
          <AlertDialogDescription>
            {showForceDelete 
              ? "Este plato está siendo usado en pedidos. ¿Desea eliminarlo de todas formas? Esto eliminará también las referencias en los pedidos."
              : "¿Está seguro de que desea eliminar este elemento?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          {showForceDelete ? (
            <AlertDialogAction 
              onClick={() => handleDelete(true)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Forzar eliminación"}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction 
              onClick={() => handleDelete(false)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Función para mostrar el diálogo de confirmación a través de un estado en el componente padre
export const useDeleteConfirmDialog = () => {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
  };
  
  const closeDeleteDialog = () => {
    setItemToDelete(null);
  };
  
  return {
    itemToDelete,
    openDeleteDialog,
    closeDeleteDialog
  };
};

export default {
  DeleteConfirmDialog,
  useDeleteConfirmDialog
};
