
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapSingleResponse } from '@/utils/supabaseHelpers';
import { MenuItem } from '../menuItemTypes';
import { deleteMenuItemImage } from '../../storage/operations/imageManagement';
import { migrateBase64ToStorage } from '../../storage/operations/imageMigration';

/**
 * Actualiza un elemento existente del menú
 */
export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  try {
    // Verificar SKU único
    if (updates.sku) {
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('id, sku')
        .eq('sku', updates.sku)
        .neq('id', id)
        .maybeSingle();
      
      if (existingSku) {
        toast.error(`El SKU "${updates.sku}" ya está en uso por otro producto.`);
        return null;
      }
    }
    
    // Procesar imagen - Migrar a Storage si es Base64
    let finalUpdates = { ...updates };
    if (updates.image_url?.startsWith('data:image/')) {
      try {
        // Obtener imagen actual para borrarla si es necesario
        const { data: currentItem } = await supabase
          .from('menu_items')
          .select('image_url')
          .eq('id', id)
          .single();
          
        if (currentItem?.image_url && !currentItem.image_url.startsWith('data:image/')) {
          // Borrar la imagen anterior en Storage
          await deleteMenuItemImage(currentItem.image_url);
        }
        
        const storageUrl = await migrateBase64ToStorage(updates.image_url);
        if (storageUrl !== updates.image_url) {
          console.log('🍽️ Imagen migrada correctamente a Storage');
          finalUpdates.image_url = storageUrl;
        }
      } catch (imageError) {
        console.error('🍽️ Error migrando imagen a Storage:', imageError);
        // Continuar con Base64 si falla la migración
      }
    }
    
    const updatesWithTimestamp = {
      ...finalUpdates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('menu_items')
      .update(updatesWithTimestamp)
      .eq('id', filterValue(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }

    return mapSingleResponse<MenuItem>(data, 'Failed to map updated menu item');
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    toast.error('Error al actualizar el elemento del menú');
    return null;
  }
};
