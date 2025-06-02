
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from '../core/storageConfig';
import { validateSelectedFile, generateUniqueFileName } from '@/components/menu/form/utils/fileValidation';

export const uploadMenuItemImage = async (
  file: File,
  fileName?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    console.log(`📤 Upload Service - Starting upload:`, {
      fileName: fileName || 'auto-generated',
      originalName: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor.name,
      isFile: file instanceof File
    });

    // Validación estricta del File object
    const validatedFile = validateSelectedFile(file);
    if (!validatedFile) {
      console.error('📤 Upload Service - File validation failed');
      return { success: false, error: 'Archivo inválido' };
    }

    // Generar nombre único si no se proporciona
    const finalFileName = fileName || generateUniqueFileName(validatedFile.name);
    const filePath = `menu/${finalFileName}`;
    
    console.log(`📤 Upload Service - Upload path:`, filePath);
    
    // Configurar opciones de upload con contentType explícito
    const uploadOptions = {
      cacheControl: '3600',
      upsert: false,
      contentType: validatedFile.type // ¡CRUCIAL! Usar el .type del File object validado
    };

    console.log(`📤 Upload Service - Upload options:`, uploadOptions);
    
    // Subir el archivo usando el patrón correcto
    console.log(`📤 Upload Service - Calling supabase.storage.upload...`);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, validatedFile, uploadOptions);

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
