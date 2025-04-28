import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { migrateAllBase64Images } from '@/services/menu/menuItemService';

// Nombre del bucket para imágenes del menú
const STORAGE_BUCKET = 'menu_images';

// Variable para evitar múltiples inicializaciones simultáneas
let isInitializing = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Inicializa el almacenamiento para asegurar que el bucket exista
 */
export const initializeStorage = async (): Promise<boolean> => {
  // Si ya hay una inicialización en progreso, devolver la promesa existente
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }
  
  // Iniciar nueva inicialización
  isInitializing = true;
  
  initializationPromise = new Promise(async (resolve) => {
    try {
      // Verificar si el bucket existe llamando a la Edge Function
      const { error } = await supabase.functions.invoke('storage-reinitialize');
      
      if (error) {
        console.error('📦 Error al inicializar almacenamiento:', error);
        isInitializing = false;
        resolve(false);
        return;
      }
      
      console.log('📦 Almacenamiento inicializado correctamente');
      
      // Intentar migrar imágenes Base64 automáticamente
      try {
        const result = await migrateAllBase64Images();
        if (result) {
          console.log('📦 Imágenes migradas correctamente');
        }
      } catch (migrationError) {
        console.error('📦 Error en migración automática:', migrationError);
        // No fallar el proceso completo si la migración falla
      }
      
      isInitializing = false;
      resolve(true);
    } catch (error) {
      console.error('Error inicializando almacenamiento:', error);
      isInitializing = false;
      resolve(false);
    }
  });
  
  return initializationPromise;
};

/**
 * Convierte una imagen File a Base64 (fallback)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se proporcionó archivo"));
      return;
    }
    
    // Validaciones básicas
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("La imagen no debe superar los 5MB"));
      return;
    }

    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      reject(new Error("Formato de imagen inválido. Use JPG, PNG, GIF o WebP"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

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
    const storageReady = await initializeStorage();
    if (!storageReady) {
      console.log('📦 No se pudo inicializar el almacenamiento, intentando con Base64 como fallback');
      const base64Data = await fileToBase64(file);
      return base64Data;
    }
    
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
    const { data: publicUrl } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
      
    console.log('📦 Imagen subida exitosamente:', publicUrl.publicUrl);
    
    return publicUrl.publicUrl;
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

/**
 * Agrega parámetros de cache busting a la URL
 */
export const getImageUrlWithCacheBusting = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Si es Base64, retornar sin modificación
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // Agregar timestamp para cache busting
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}t=${Date.now()}`;
};

/**
 * Migra imágenes Base64 existentes a Supabase Storage
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
    
    // Subir archivo a Supabase Storage
    const result = await uploadMenuItemImage(file);
    if (typeof result === 'string' && !result.startsWith('data:image/')) {
      return result;
    }
    
    // Si falla, devolver la imagen Base64 original
    return base64Image;
  } catch (error) {
    console.error('Error al migrar imagen Base64:', error);
    return base64Image;
  }
};

// Re-export migrateAllBase64Images for backward compatibility
export { migrateAllBase64Images };
