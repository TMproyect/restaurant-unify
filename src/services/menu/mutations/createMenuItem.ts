
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapSingleResponse } from '@/utils/supabaseHelpers';
import { MenuItem } from '../menuItemTypes';
import { migrateBase64ToStorage } from '../../storage/operations/imageMigration';

/**
 * Crea un nuevo elemento del menú
 */
export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> => {
  try {
    console.log('🍽️ Creando nuevo ítem del menú:', { 
      ...item, 
      image_url: item.image_url ? 'Imagen proporcionada' : undefined
    });
    
    // Verificar SKU único
    if (item.sku) {
      console.log('🍽️ Verificando si el SKU ya existe:', item.sku);
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('sku')
        .eq('sku', item.sku)
        .maybeSingle();
      
      if (skuError) {
        console.error('🍽️ Error al verificar SKU:', skuError);
      }
      
      if (existingSku) {
        console.log('🍽️ SKU ya existe:', existingSku);
        toast.error(`El SKU "${item.sku}" ya está en uso por otro producto.`);
        return null;
      }
    }
    
    // Procesar imagen - Migrar a Storage si es Base64
    let finalImageUrl = item.image_url;
    if (item.image_url?.startsWith('data:image/')) {
      try {
        const storageUrl = await migrateBase64ToStorage(item.image_url);
        if (storageUrl !== item.image_url) {
          console.log('🍽️ Imagen migrada correctamente a Storage');
          finalImageUrl = storageUrl;
        }
      } catch (imageError) {
        console.error('🍽️ Error migrando imagen a Storage:', imageError);
        // Continuar con Base64 si falla la migración
      }
    }
    
    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ ...item, image_url: finalImageUrl }])
      .select()
      .single();

    if (error) {
      console.error('🍽️ Error al crear ítem del menú:', error);
      throw error;
    }

    console.log('🍽️ Ítem creado exitosamente');
    return mapSingleResponse<MenuItem>(data, 'Error mapeando ítem creado');
  } catch (error) {
    console.error('🍽️ Error en createMenuItem:', error);
    toast.error('Error al crear el elemento del menú');
    return null;
  }
};
