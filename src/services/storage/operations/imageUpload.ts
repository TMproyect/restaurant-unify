
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from '../core/storageConfig';

export const uploadMenuItemImage = async (
  file: File,
  fileName: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    console.log(`📤 Upload Service - Starting upload:`, {
      fileName,
      originalName: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor.name,
      isFile: file instanceof File
    });

    // Validate the file object
    if (!(file instanceof File)) {
      console.error('📤 Upload Service - Invalid file object, not a File instance');
      return { success: false, error: 'Objeto de archivo inválido' };
    }

    if (!file.type || !file.type.startsWith('image/')) {
      console.error('📤 Upload Service - Invalid file type:', file.type);
      return { success: false, error: 'Tipo de archivo no válido' };
    }

    // Crear la ruta completa dentro del bucket usando el prefijo 'menu/'
    const filePath = `menu/${fileName}`;
    console.log(`📤 Upload Service - Upload path:`, filePath);
    
    // Subir el archivo usando el patrón correcto
    console.log(`📤 Upload Service - Calling supabase.storage.upload...`);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('📤 Upload Service - Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.path) {
      console.error('📤 Upload Service - No path returned from upload, data:', data);
      return { success: false, error: 'No se pudo obtener la ruta del archivo' };
    }

    console.log(`📤 Upload Service - Upload successful, path:`, data.path);

    // Obtener la URL pública usando la ruta devuelta por la subida
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    console.log(`📤 Upload Service - Generated public URL:`, publicUrl);
    
    // Verify the URL is accessible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log(`📤 Upload Service - URL accessibility check:`, {
        status: response.status,
        ok: response.ok
      });
    } catch (fetchError) {
      console.warn(`📤 Upload Service - URL accessibility check failed:`, fetchError);
      // Don't fail the upload for this, just warn
    }
    
    return {
      success: true,
      imageUrl: publicUrl
    };

  } catch (error) {
    console.error('📤 Upload Service - Exception during upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al subir la imagen'
    };
  }
};
