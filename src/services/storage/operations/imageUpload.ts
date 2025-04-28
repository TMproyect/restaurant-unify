
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { initializeStorage } from '../core/storageInitialization';
import { fileToBase64 } from '../core/imageConversion';
import { STORAGE_BUCKET, getPublicUrl } from '../core/storageConfig';

/**
 * Sube una imagen a Supabase Storage
 */
export const uploadMenuItemImage = async (file: File): Promise<string | { error?: string; url?: string }> => {
  if (!file) {
    toast.error("No se seleccionó ningún archivo");
    return { error: "No se seleccionó ningún archivo" };
  }

  try {
    console.log(`📦 Procesando imagen: ${file.name}, tamaño: ${file.size} bytes, tipo: ${file.type}`);
    
    // Validaciones
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return { error: "La imagen no debe superar los 5MB" };
    }

    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      toast.error("Formato de imagen inválido. Use JPG, PNG, GIF o WebP");
      return { error: "Formato de imagen inválido. Use JPG, PNG, GIF o WebP" };
    }
    
    // Asegurar que el almacenamiento está inicializado antes de subir
    await initializeStorage();
    
    // Generar un nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `menu/${fileName}`;
    
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('📦 Error al subir imagen:', error);
      
      // Si falla, intentar con Base64 como fallback
      console.log('📦 Intentando método fallback con Base64');
      const base64Data = await fileToBase64(file);
      return base64Data;
    }
    
    // Obtener URL pública
    const publicUrl = getPublicUrl(filePath);
    console.log('📦 Imagen subida exitosamente:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('📦 Error procesando imagen:', error);
    
    // Intentar con Base64 como último recurso
    try {
      const base64Data = await fileToBase64(file);
      console.log('📦 Imagen convertida a Base64 como fallback');
      return base64Data;
    } catch (fallbackError) {
      return { error: "Error al procesar la imagen" };
    }
  }
};
