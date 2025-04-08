
// Re-export the components from the .tsx file
export { DeleteConfirmDialog, useDeleteConfirmDialog } from './menuItemIntegration.tsx';

import { deleteMenuItem } from '@/services/menu/menuItemService';
import { toast } from 'sonner';

// Exportar la función de eliminación con confirmación para su uso en componentes
export const deleteMenuItemWithConfirmation = async (id: string): Promise<boolean> => {
  if (!window.confirm("¿Está seguro de que desea eliminar este elemento?")) {
    return false;
  }
  
  // Primer intento sin forzar eliminación
  const success = await deleteMenuItem(id, false);
  
  if (!success) {
    // Si falla, preguntar si quiere forzar la eliminación
    if (window.confirm("Este plato está siendo usado en pedidos. ¿Desea eliminarlo de todas formas? Esto eliminará también las referencias en los pedidos.")) {
      const forceSuccess = await deleteMenuItem(id, true);
      if (forceSuccess) {
        toast.success("Elemento eliminado con éxito");
        // Dispara evento para actualizar la lista
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        return true;
      }
    }
    return false;
  } 
  
  toast.success("Elemento eliminado con éxito");
  // Dispara evento para actualizar la lista
  window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  return true;
};

// Esto es para compatibilidad con el código existente
// Permitir que el MenuManager acceda a esta función a través del objeto window
declare global {
  interface Window {
    deleteMenuItemWithConfirmation: typeof deleteMenuItemWithConfirmation;
  }
}

// Exponer la función al objeto window
window.deleteMenuItemWithConfirmation = deleteMenuItemWithConfirmation;

export default {
  deleteMenuItemWithConfirmation
};
