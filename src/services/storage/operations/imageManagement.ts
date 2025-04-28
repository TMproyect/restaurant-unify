
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from '../core/storageConfig';

/**
 * Elimina una imagen de Supabase Storage
 */
export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return true;
  
  // Si es Base64, no hay nada que eliminar
  if (imageUrl.startsWith('data:image/')) {
    return true;
  }
  
  try {
    // Extraer la ruta del archivo de la URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const filePath = pathSegments.slice(-2).join('/'); // Formato: 'menu/uuid.ext'
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('📦 Error al eliminar imagen:', error);
      return false;
    }
    
    console.log('📦 Imagen eliminada correctamente:', filePath);
    return true;
  } catch (error) {
    console.error('📦 Error en deleteMenuItemImage:', error);
    return false;
  }
};
