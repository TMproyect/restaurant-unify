
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
    console.log('📝 FormSubmission - ⭐ STARTING DATABASE SUBMISSION');
    console.log('📝 FormSubmission - Data received:', {
      name: data.name,
      price: data.price,
      category_id: data.category_id,
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'NO IMAGE URL',
      hasImageUrl: !!imageUrl,
      isUpdate: !!item
    });
    
    // Build item data for submission
    const itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      category_id: data.category_id,
      available: data.available,
      popular: data.popular,
      allergens: data.allergens || [],
      sku: data.sku || '',
      image_url: imageUrl, // 🔥 CRITICAL: This must be the URL from upload
    };
    
    console.log('📝 FormSubmission - Final item data for database:', {
      ...itemData,
      image_url: itemData.image_url ? `URL: ${itemData.image_url.substring(0, 50)}...` : '❌ NO IMAGE URL'
    });
    
    try {
      let result: MenuItem | null = null;
      
      if (item) {
        console.log('📝 FormSubmission - 🔄 UPDATING existing item with ID:', item.id);
        result = await updateMenuItem(item.id, itemData);
      } else {
        console.log('📝 FormSubmission - 🔄 CREATING new item...');
        result = await createMenuItem(itemData);
      }
      
      if (result) {
        console.log('📝 FormSubmission - ✅ DATABASE OPERATION SUCCESSFUL:', {
          id: result.id,
          name: result.name,
          savedImageUrl: result.image_url ? `${result.image_url.substring(0, 50)}...` : '❌ NO URL SAVED',
          hasImageUrlInDb: !!result.image_url
        });
        
        // Verify the URL was actually saved
        if (imageUrl && !result.image_url) {
          console.error('📝 FormSubmission - ⚠️ WARNING: Image URL was not saved to database!');
          console.error('📝 FormSubmission - Expected URL:', imageUrl);
          console.error('📝 FormSubmission - Saved URL:', result.image_url);
        }
        
        toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
        
        // Notify other components about the update
        console.log('📝 FormSubmission - 🔄 Dispatching update event...');
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        
        console.log('📝 FormSubmission - 🔄 Calling onClose(true)...');
        onClose(true);
        
        return true;
      } else {
        console.error('📝 FormSubmission - ❌ DATABASE OPERATION FAILED: No result returned');
        toast.error(item ? 'Error al actualizar el elemento' : 'Error al crear el elemento');
        return false;
      }
      
    } catch (error) {
      console.error('📝 FormSubmission - ❌ EXCEPTION IN DATABASE OPERATION:', error);
      toast.error('Error al guardar el elemento');
      return false;
    }
  };

  return { submitForm };
};
