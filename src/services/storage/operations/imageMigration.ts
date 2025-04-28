
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { initializeStorage } from '../core/storageInitialization';
import { STORAGE_BUCKET, getPublicUrl } from '../core/storageConfig';
import { base64ToFile } from '../core/imageConversion';

/**
 * Migra una imagen Base64 a Supabase Storage
 */
export const migrateBase64ToStorage = async (base64Image: string): Promise<string> => {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    return base64Image;
  }
  
  try {
    // Inicializar almacenamiento si es necesario
    const initialized = await initializeStorage();
    if (!initialized) {
      console.warn('📦 No se pudo inicializar almacenamiento, continuando con base64');
      return base64Image;
    }
    
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
        upsert: false,
        contentType: mimeType
      });
    
    if (error) {
      console.error('📦 Error al migrar imagen Base64 a Storage:', error);
      return base64Image; // Devolver la imagen Base64 original si falla la migración
    }
    
    // Obtener URL pública
    const publicUrl = getPublicUrl(filePath);
    console.log('📦 Imagen Base64 migrada exitosamente a Storage:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error al migrar imagen Base64:', error);
    return base64Image;
  }
};

/**
 * Migra todas las imágenes Base64 existentes a Supabase Storage
 */
export const migrateAllBase64Images = async (): Promise<boolean> => {
  try {
    console.log('📦 Buscando imágenes Base64 para migrar...');
    
    // Obtener todos los items con imágenes Base64
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, image_url')
      .ilike('image_url', 'data:image/%');
    
    if (error) {
      console.error('Error obteniendo imágenes Base64:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('No hay imágenes Base64 para migrar');
      return true;
    }
    
    console.log(`Migrando ${data.length} imágenes Base64 a Storage`);
    
    // Procesar cada imagen
    let successCount = 0;
    for (const item of data) {
      if (item.image_url && item.image_url.startsWith('data:image/')) {
        try {
          const storageUrl = await migrateBase64ToStorage(item.image_url);
          
          if (storageUrl !== item.image_url) {
            // Actualizar el ítem con la nueva URL
            const { error: updateError } = await supabase
              .from('menu_items')
              .update({ 
                image_url: storageUrl,
                updated_at: new Date().toISOString() 
              })
              .eq('id', item.id);
              
            if (!updateError) {
              successCount++;
              console.log(`📦 Imagen para item ${item.id} migrada correctamente`);
            } else {
              console.error(`Error actualizando imagen para item ${item.id}:`, updateError);
            }
          }
        } catch (migrationError) {
          console.error(`Error migrando imagen para item ${item.id}:`, migrationError);
        }
      }
    }
    
    console.log(`Migración completada: ${successCount}/${data.length} imágenes migradas exitosamente`);
    return successCount > 0;
  } catch (error) {
    console.error('Error en migrateAllBase64Images:', error);
    return false;
  }
};
