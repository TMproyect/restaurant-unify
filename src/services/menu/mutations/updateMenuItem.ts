
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapSingleResponse } from '@/utils/supabaseHelpers';
import { MenuItem } from '../menuItemTypes';

/**
 * Actualiza un elemento existente del menú
 */
export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  try {
    console.log('🍽️ Update Service - Updating menu item:', {
      id,
      updates: {
        ...updates,
        image_url: updates.image_url ? `URL presente (${updates.image_url.substring(0, 50)}...)` : 'Sin cambio de imagen'
      }
    });
    
    // Verificar SKU único
    if (updates.sku) {
      console.log('🍽️ Update Service - Checking SKU uniqueness:', updates.sku);
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('id, sku')
        .eq('sku', updates.sku)
        .neq('id', id)
        .maybeSingle();
      
      if (existingSku) {
        console.log('🍽️ Update Service - SKU already exists in another item:', existingSku);
        toast.error(`El SKU "${updates.sku}" ya está en uso por otro producto.`);
        return null;
      }
    }
    
    // Actualizar directamente con los datos proporcionados
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    console.log('🍽️ Update Service - Executing database update...');
    const { data, error } = await supabase
      .from('menu_items')
      .update(updatesWithTimestamp)
      .eq('id', filterValue(id))
      .select()
      .single();

    if (error) {
      console.error('🍽️ Update Service - Database update error:', error);
      throw error;
    }

    console.log('🍽️ Update Service - Item updated successfully:', {
      id: data?.id,
      name: data?.name,
      hasImageUrl: !!data?.image_url,
      imageUrl: data?.image_url ? `${data.image_url.substring(0, 50)}...` : 'Sin imagen'
    });

    return mapSingleResponse<MenuItem>(data, 'Failed to map updated menu item');
  } catch (error) {
    console.error('🍽️ Update Service - Error in updateMenuItem:', error);
    toast.error('Error al actualizar el elemento del menú');
    return null;
  }
};
