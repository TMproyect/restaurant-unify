
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { MenuItem, deleteMenuItem } from '@/services/menu/menuItemService';

interface MenuItemDeleteDialogProps {
  item: MenuItem | null;
  onCancel: () => void;
  onDeleted: () => void;
}

const MenuItemDeleteDialog: React.FC<MenuItemDeleteDialogProps> = ({
  item,
  onCancel,
  onDeleted
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!item) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteMenuItem(item.id, forceDelete);
      
      if (success) {
        toast.success('Elemento eliminado con éxito');
        onDeleted();
      } else if (!forceDelete) {
        toast.error('No se pudo eliminar el elemento porque está siendo usado en pedidos');
        setForceDelete(true);
        return;
      } else {
        toast.error('Error al eliminar el elemento');
      }
      
      onCancel();
      setForceDelete(false);
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
      toast.error('Error al eliminar el elemento');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={!!item} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {forceDelete 
              ? "¿Eliminar permanentemente este plato?" 
              : "¿Eliminar este plato?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {forceDelete ? (
              <div className="space-y-2 py-2">
                <p>
                  Este plato está asociado a pedidos existentes. Eliminarlo afectará los registros históricos.
                </p>
                <p>
                  <strong className="text-destructive">Esta acción no se puede deshacer</strong> y podría causar 
                  problemas en la visualización de pedidos antiguos.
                </p>
                <p>
                  En lugar de eliminar, considera marcar el plato como no disponible.
                </p>
              </div>
            ) : (
              "Esta acción no se puede deshacer. El plato será eliminado permanentemente."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteConfirm();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>Eliminar{forceDelete ? " permanentemente" : ""}</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MenuItemDeleteDialog;
