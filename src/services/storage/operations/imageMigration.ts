
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { initializeStorage } from '../core/storageInitialization';
import { STORAGE_BUCKET, getPublicUrl } from '../core/storageConfig';
import { base64ToFile } from '../core/imageConversion';
import { toast } from 'sonner';

/**
 * Migra una imagen Base64 a Supabase Storage
 */
export const migrateBase64ToStorage = async (base64Image: string): Promise<string> => {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    return base64Image;
  }
  
  try {
    console.log('📦 Migrando imagen Base64 a almacenamiento');
    
    // Inicializar almacenamiento si es necesario - forzamos la inicialización
    const initialized = await initializeStorage(true);
    if (!initialized) {
      console.warn('📦 No se pudo inicializar almacenamiento, continuando con base64');
      return base64Image;
    }
    
    // Convertir Base64 a File/Blob
    const { blob, mimeType, fileExt } = base64ToFile(base64Image);
    
    // Generar un nombre único para el archivo
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `menu/${fileName}`;
    
    console.log(`📦 Subiendo imagen como ${fileExt}, tamaño: ${Math.round(blob.size/1024)}KB`);
    
    // Subir archivo a Supabase Storage con múltiples intentos
    let attempts = 0;
    const maxAttempts = 3;
    let uploadError = null;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`📦 Intento ${attempts} de subir imagen`);
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: attempts > 1, // En reintentos, usar upsert
            contentType: mimeType
          });
        
        if (error) {
          console.error(`📦 Error al migrar imagen (intento ${attempts}):`, error);
          uploadError = error;
          // Esperar antes de reintentar
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000));
          }
        } else {
          // Obtener URL pública
          const publicUrl = getPublicUrl(filePath);
          console.log('📦 Imagen Base64 migrada exitosamente a Storage:', publicUrl);
          
          // Verificar que la URL es accesible
          try {
            const checkResponse = await fetch(publicUrl, { method: 'HEAD' });
            if (checkResponse.ok) {
              console.log('📦 URL de imagen verificada como accesible');
              return publicUrl;
            } else {
              console.error('📦 URL de imagen no accesible:', checkResponse.status);
              // Si la URL no es accesible, devolver la imagen Base64 original
              return base64Image;
            }
          } catch (fetchError) {
            console.error('📦 Error verificando URL de imagen:', fetchError);
            // Devolver la imagen Base64 original si hay error en la verificación
            return base64Image;
          }
        }
      } catch (attemptError) {
        console.error(`📦 Error en intento ${attempts}:`, attemptError);
        uploadError = attemptError;
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    
    console.error('📦 Todos los intentos de migración fallaron, devolviendo Base64 original');
    return base64Image;
  } catch (error) {
    console.error('Error crítico al migrar imagen Base64:', error);
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
      .select('id, image_url, name')
      .ilike('image_url', 'data:image/%');
    
    if (error) {
      console.error('Error obteniendo imágenes Base64:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('No hay imágenes Base64 para migrar');
      return true;
    }
    
    console.log(`Encontradas ${data.length} imágenes Base64 para migrar`);
    
    // Procesar cada imagen
    let successCount = 0;
    const totalImages = data.length;
    
    for (const item of data) {
      if (!item.image_url || !item.image_url.startsWith('data:image/')) {
        continue;
      }
      
      try {
        console.log(`📦 Migrando imagen para "${item.name}" (ID: ${item.id})`);
        const storageUrl = await migrateBase64ToStorage(item.image_url);
        
        if (storageUrl !== item.image_url) {
          // Verificar que la URL de Storage es accesible antes de actualizar la BD
          try {
            const checkResponse = await fetch(storageUrl, { method: 'HEAD' });
            if (!checkResponse.ok) {
              console.error(`📦 URL de imagen no accesible para item ${item.id}, omitiendo actualización`);
              continue;
            }
          } catch (fetchError) {
            console.error(`📦 Error verificando URL para item ${item.id}:`, fetchError);
            continue;
          }
          
          // Actualizar el ítem con la nueva URL
          console.log(`📦 Imagen migrada, actualizando item en base de datos`);
          const { error: updateError } = await supabase
            .from('menu_items')
            .update({ 
              image_url: storageUrl,
              updated_at: new Date().toISOString() 
            })
            .eq('id', item.id);
            
          if (!updateError) {
            successCount++;
            console.log(`📦 Imagen para item ${item.id} migrada correctamente (${successCount}/${totalImages})`);
          } else {
            console.error(`Error actualizando imagen para item ${item.id}:`, updateError);
          }
        } else {
          console.log(`📦 No se pudo migrar imagen para item ${item.id}, se mantiene como Base64`);
        }
      } catch (migrationError) {
        console.error(`Error grave migrando imagen para item ${item.id}:`, migrationError);
      }
    }
    
    console.log(`Migración completada: ${successCount}/${totalImages} imágenes migradas exitosamente`);
    return successCount > 0;
  } catch (error) {
    console.error('Error crítico en migrateAllBase64Images:', error);
    return false;
  }
};
