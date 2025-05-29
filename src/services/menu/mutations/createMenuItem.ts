
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapSingleResponse } from '@/utils/supabaseHelpers';
import { MenuItem } from '../menuItemTypes';

/**
 * Crea un nuevo elemento del menú
 */
export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> => {
  try {
    console.log('🍽️ Create Service - Creating new menu item:', { 
      ...item, 
      image_url: item.image_url ? `URL presente (${item.image_url.substring(0, 50)}...)` : 'Sin imagen'
    });
    
    // Verificar SKU único
    if (item.sku) {
      console.log('🍽️ Create Service - Checking SKU uniqueness:', item.sku);
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('sku')
        .eq('sku', item.sku)
        .maybeSingle();
      
      if (skuError) {
        console.error('🍽️ Create Service - Error checking SKU:', skuError);
      }
      
      if (existingSku) {
        console.log('🍽️ Create Service - SKU already exists:', existingSku);
        toast.error(`El SKU "${item.sku}" ya está en uso por otro producto.`);
        return null;
      }
    }
    
    // Insertar en la base de datos directamente con la URL proporcionada
    console.log('🍽️ Create Service - Inserting into database...');
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('🍽️ Create Service - Database insert error:', error);
      throw error;
    }

    console.log('🍽️ Create Service - Item created successfully:', {
      id: data?.id,
      name: data?.name,
      hasImageUrl: !!data?.image_url,
      imageUrl: data?.image_url ? `${data.image_url.substring(0, 50)}...` : 'Sin imagen'
    });
    
    return mapSingleResponse<MenuItem>(data, 'Error mapeando ítem creado');
  } catch (error) {
    console.error('🍽️ Create Service - Error in createMenuItem:', error);
    toast.error('Error al crear el elemento del menú');
    return null;
  }
};
