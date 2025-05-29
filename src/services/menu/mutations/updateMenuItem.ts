
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapSingleResponse } from '@/utils/supabaseHelpers';
import { MenuItem } from '../menuItemTypes';

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
    
    // Actualizar directamente con los datos proporcionados
    // Los formularios ya manejan el upload de la imagen
    const updatesWithTimestamp = {
      ...updates,
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
