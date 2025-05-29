
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from '../core/storageConfig';

export const uploadMenuItemImage = async (
  file: File,
  fileName: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    console.log(`📤 Uploading image: ${fileName}`, {
      type: file.type,
      size: file.size
    });

    // Crear la ruta completa dentro del bucket usando el prefijo 'menu/'
    const filePath = `menu/${fileName}`;
    
    // Subir el archivo usando el patrón correcto
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.path) {
      console.error('❌ No path returned from upload');
      return { success: false, error: 'No se pudo obtener la ruta del archivo' };
    }

    // Obtener la URL pública usando la ruta devuelta por la subida
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    console.log(`✅ Upload successful: ${publicUrl}`);
    
    return {
      success: true,
      imageUrl: publicUrl
    };

  } catch (error) {
    console.error('❌ Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al subir la imagen'
    };
  }
};
