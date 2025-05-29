
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { MenuItemFormValues } from '../schemas/menuItemFormSchema';

export const useMenuFormSubmission = () => {
  const submitForm = async (
    data: MenuItemFormValues,
    imageUrl: string | undefined,
    item: MenuItem | null,
    onClose: (saved: boolean) => void
  ): Promise<boolean> => {
    console.log('📝 FormSubmission - Starting form submission...');
    
    // Build item data for submission
    const itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      category_id: data.category_id,
      available: data.available,
      popular: data.popular,
      allergens: data.allergens || [],
      sku: data.sku,
      image_url: imageUrl,
    };
    
    console.log('📝 FormSubmission - Final item data for save:', {
      ...itemData,
      image_url: itemData.image_url ? 'URL presente' : 'Sin URL'
    });
    
    let success: boolean;
    
    try {
      // Create or update the menu item
      if (item) {
        console.log('📝 FormSubmission - Updating existing item with ID:', item.id);
        const updatedItem = await updateMenuItem(item.id, itemData);
        success = !!updatedItem;
        if (success) {
          console.log('📝 FormSubmission - Item updated successfully:', {
            id: updatedItem?.id,
            name: updatedItem?.name,
            hasImageUrl: !!updatedItem?.image_url
          });
        } else {
          console.error('📝 FormSubmission - Failed to update item');
        }
      } else {
        console.log('📝 FormSubmission - Creating new item...');
        const newItem = await createMenuItem(itemData);
        success = !!newItem;
        if (success) {
          console.log('📝 FormSubmission - Item created successfully:', {
            id: newItem?.id,
            name: newItem?.name,
            hasImageUrl: !!newItem?.image_url
          });
        } else {
          console.error('📝 FormSubmission - Failed to create item');
        }
      }
      
      if (success) {
        toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
        
        // Notify other components about the update
        console.log('📝 FormSubmission - Dispatching menuItemsUpdated event');
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        
        onClose(true);
      } else {
        toast.error(item ? 'Error al actualizar el elemento' : 'Error al crear el elemento');
      }
      
      return success;
    } catch (error) {
      console.error('📝 FormSubmission - Error in form submission:', error);
      toast.error('Error al guardar el elemento');
      return false;
    }
  };

  return { submitForm };
};
