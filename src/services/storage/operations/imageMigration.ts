
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_BUCKET, getPublicUrl } from '../core/storageConfig';
import { base64ToFile } from '../core/imageConversion';

/**
 * Migra una imagen Base64 a Supabase Storage
 * @param {string} base64Image - Imagen en formato Base64
 * @returns {Promise<string>} - URL de la imagen migrada o la original si falla
 */
export const migrateBase64ToStorage = async (base64Image: string): Promise<string> => {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    return base64Image;
  }
  
  try {
    // Convertir Base64 a File/Blob
    const { blob, mimeType, fileExt } = base64ToFile(base64Image);
    
    // Generar un nombre único para el archivo
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `menu/${fileName}`;
    
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, blob, {
        cacheControl: '3600',
        contentType: mimeType
      });
    
    if (error) {
      return base64Image; // Mantener la imagen Base64 original si hay error
    }
    
    // Obtener URL pública
    const publicUrl = getPublicUrl(filePath);
    
    // Verificar que la imagen sea accesible antes de devolver la URL
    try {
      const checkResponse = await fetch(publicUrl, { method: 'HEAD' });
      if (checkResponse.ok) {
        return publicUrl;
      }
    } catch (fetchError) {
      // Ignorar error de verificación
    }
    
    // Si llegamos aquí, hubo algún problema con la verificación
    return base64Image;
  } catch (error) {
    // Devolver la imagen Base64 original en caso de error
    return base64Image;
  }
};

/**
 * Migra todas las imágenes Base64 existentes a Supabase Storage
 * de forma silenciosa y sin bloquear la UI
 */
export const migrateAllBase64Images = async (): Promise<boolean> => {
  try {
    // Obtener todos los items con imágenes Base64
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, image_url, name')
      .ilike('image_url', 'data:image/%');
    
    if (error || !data || data.length === 0) {
      // No hay imágenes para migrar o hubo un error
      return false;
    }
    
    // Procesar cada imagen sin bloquear la UI
    let successCount = 0;
    
    for (const item of data) {
      if (!item.image_url || !item.image_url.startsWith('data:image/')) {
        continue;
      }
      
      try {
        // Migrar imagen a Storage
        const storageUrl = await migrateBase64ToStorage(item.image_url);
        
        if (storageUrl !== item.image_url) {
          // Actualizar el ítem con la nueva URL
          const { error: updateError } = await supabase
            .from('menu_items')
            .update({ image_url: storageUrl, updated_at: new Date().toISOString() })
            .eq('id', item.id);
            
          if (!updateError) {
            successCount++;
          }
        }
      } catch (migrationError) {
        // Ignorar errores individuales para que el proceso continúe
      }
    }
    
    return successCount > 0;
  } catch (error) {
    // Ignorar errores del proceso completo
    return false;
  }
};
