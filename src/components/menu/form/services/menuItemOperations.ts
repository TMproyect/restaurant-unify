
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { MenuItemFormValues } from '../schemas/menuItemFormSchema';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';

/**
 * Service for menu item CRUD operations with improved error handling
 */
export class MenuItemOperations {
  /**
   * Creates or updates a menu item with robust error handling
   */
  static async saveMenuItem(
    data: MenuItemFormValues, 
    item: MenuItem | null, 
    imageUrl?: string | null
  ): Promise<MenuItem | null> {
    console.log('💾 Operations: Saving menu item with data:', {
      ...data,
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'none'
    });

    const itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      category_id: data.category_id,
      available: data.available,
      popular: data.popular,
      allergens: data.allergens || [],
      sku: data.sku || '',
      image_url: imageUrl || item?.image_url || null,
    };

    try {
      let result: MenuItem | null = null;
      
      if (item) {
        console.log('🔄 Operations: Updating existing item with ID:', item.id);
        result = await updateMenuItem(item.id, itemData);
      } else {
        console.log('➕ Operations: Creating new item');
        result = await createMenuItem(itemData);
      }

      if (!result) {
        throw new Error('Failed to save item - no result returned');
      }

      console.log('✅ Operations: Item saved successfully with ID:', result.id);
      return result;

    } catch (error) {
      console.error('❌ Operations: Error saving item:', error);
      
      // Mejorar el manejo de errores específicos
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          throw new Error('Error de conexión. Verifique su internet.');
        } else if (error.message.includes('validation')) {
          throw new Error('Datos inválidos. Verifique los campos.');
        } else if (error.message.includes('permission')) {
          throw new Error('No tiene permisos para realizar esta acción.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Triggers UI refresh after successful operations
   */
  static triggerRefresh(): void {
    console.log('🔄 Operations: Triggering refresh event');
    try {
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
    } catch (error) {
      console.error('❌ Operations: Error triggering refresh:', error);
    }
  }

  /**
   * Shows success toast based on operation type
   */
  static showSuccessMessage(isEdit: boolean): void {
    const message = isEdit ? 'Producto actualizado con éxito' : 'Producto creado con éxito';
    toast.success(message);
  }

  /**
   * Shows error toast with improved message
   */
  static showErrorMessage(error: unknown): void {
    let errorMessage = 'Error desconocido';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('❌ Operations: Showing error message:', errorMessage);
    toast.error(`Error al guardar producto: ${errorMessage}`);
  }
}
