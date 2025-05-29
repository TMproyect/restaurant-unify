
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { MenuItemFormValues } from '../schemas/menuItemFormSchema';
import { supabase } from '@/integrations/supabase/client';

export const useMenuFormSubmission = () => {
  // Verify the item was saved with the correct URL
  const verifyItemSaved = async (
    itemId: string, 
    expectedImageUrl: string | undefined
  ): Promise<boolean> => {
    try {
      console.log('📝 FormSubmission - 🔍 Verifying item was saved correctly...');
      
      const { data: savedItem, error } = await supabase
        .from('menu_items')
        .select('id, name, image_url')
        .eq('id', itemId)
        .single();
      
      if (error) {
        console.error('📝 FormSubmission - Error verifying saved item:', error);
        return false;
      }
      
      const urlsMatch = savedItem.image_url === expectedImageUrl;
      
      console.log('📝 FormSubmission - Verification result:', {
        itemId: savedItem.id,
        itemName: savedItem.name,
        expectedUrl: expectedImageUrl ? `${expectedImageUrl.substring(0, 50)}...` : 'None',
        actualUrl: savedItem.image_url ? `${savedItem.image_url.substring(0, 50)}...` : 'None',
        urlsMatch
      });
      
      if (!urlsMatch) {
        console.error('📝 FormSubmission - ⚠️ URL MISMATCH DETECTED!');
        console.error('📝 FormSubmission - Expected:', expectedImageUrl);
        console.error('📝 FormSubmission - Actual:', savedItem.image_url);
      }
      
      return urlsMatch;
    } catch (error) {
      console.error('📝 FormSubmission - Exception during verification:', error);
      return false;
    }
  };

  const submitForm = async (
    data: MenuItemFormValues,
    imageUrl: string | undefined,
    item: MenuItem | null,
    onClose: (saved: boolean) => void
  ): Promise<boolean> => {
    console.log('📝 FormSubmission - ⭐ STARTING DATABASE SUBMISSION');
    console.log('📝 FormSubmission - Submission details:', {
      name: data.name,
      price: data.price,
      category_id: data.category_id,
      hasImageUrl: !!imageUrl,
      imageUrlPreview: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'NO IMAGE URL',
      isUpdate: !!item,
      itemId: item?.id || 'NEW'
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
      image_url: imageUrl, // 🔥 CRITICAL: This must be the verified URL from upload
    };
    
    console.log('📝 FormSubmission - Final item data for database:', {
      ...itemData,
      image_url: itemData.image_url ? `VALID URL: ${itemData.image_url.substring(0, 50)}...` : '❌ NO IMAGE URL'
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
      
      if (!result) {
        console.error('📝 FormSubmission - ❌ DATABASE OPERATION FAILED: No result returned');
        toast.error(item ? 'Error al actualizar el elemento' : 'Error al crear el elemento');
        return false;
      }
      
      console.log('📝 FormSubmission - ✅ DATABASE OPERATION SUCCESSFUL:', {
        id: result.id,
        name: result.name,
        savedImageUrl: result.image_url ? `${result.image_url.substring(0, 50)}...` : '❌ NO URL SAVED',
        hasImageUrlInDb: !!result.image_url
      });
      
      // Verify the URL was actually saved correctly
      if (imageUrl) {
        console.log('📝 FormSubmission - 🔍 Performing additional verification...');
        const verificationPassed = await verifyItemSaved(result.id, imageUrl);
        
        if (!verificationPassed) {
          console.error('📝 FormSubmission - ❌ VERIFICATION FAILED: Image URL not saved correctly');
          toast.error('El elemento se guardó pero hubo un problema con la imagen. Verifique y edite si es necesario.');
          // Don't return false here - the item was saved, just warn the user
        } else {
          console.log('📝 FormSubmission - ✅ VERIFICATION PASSED: Image URL saved correctly');
        }
      }
      
      toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
      
      // Notify other components about the update
      console.log('📝 FormSubmission - 🔄 Dispatching update event...');
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      
      console.log('📝 FormSubmission - 🔄 Calling onClose(true)...');
      onClose(true);
      
      return true;
      
    } catch (error) {
      console.error('📝 FormSubmission - ❌ EXCEPTION IN DATABASE OPERATION:', error);
      toast.error('Error al guardar el elemento');
      return false;
    }
  };

  return { submitForm };
};
