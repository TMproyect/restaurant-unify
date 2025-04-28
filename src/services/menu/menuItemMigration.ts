
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { initializeStorage } from '../storage/imageStorage';

// Nombre del bucket para imágenes del menú
const STORAGE_BUCKET = 'menu_images';

/**
 * Migra una imagen Base64 a Supabase Storage
 */
export const migrateBase64ToStorage = async (base64Image: string): Promise<string> => {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    return base64Image;
  }
  
  try {
    // Convertir Base64 a File
    const mimeType = base64Image.split(';')[0].split(':')[1];
    const byteString = atob(base64Image.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const file = new File([blob], `migrated-${uuidv4()}.${mimeType.split('/')[1]}`, { type: mimeType });
    
    // Asegurar que el almacenamiento está inicializado antes de subir
    await initializeStorage();
    
    // Subir archivo a Supabase Storage
    try {
      // Generar un nombre único para el archivo
      const fileExt = mimeType.split('/')[1];
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `menu/${fileName}`;
      
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
      const { data: publicUrl } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
        
      console.log('📦 Imagen Base64 migrada exitosamente a Storage:', publicUrl.publicUrl);
      
      return publicUrl.publicUrl;
    } catch (uploadError) {
      console.error('Error al subir imagen convertida:', uploadError);
      return base64Image;
    }
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
