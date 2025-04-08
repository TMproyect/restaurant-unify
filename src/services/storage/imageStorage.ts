
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Almacenar nombre del bucket en una constante para evitar errores de tipeo
const BUCKET_NAME = 'menu_images';

/**
 * Verifica que el bucket exista sin intentar crearlo repetidamente
 * Esta verificación solo se hace cuando es absolutamente necesario
 */
const verifyBucketExists = async (): Promise<boolean> => {
  try {
    // Primero intentamos listar archivos que es una operación menos intrusiva
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
      
    if (!error) {
      return true; // Si podemos listar, el bucket existe y tenemos acceso
    }

    // Si hay un error, puede ser que el bucket no exista o no tengamos permisos
    // Verificamos si existe consultando buckets disponibles
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME) || false;
    
    if (bucketExists) {
      // El bucket existe pero no podemos acceder, es problema de permisos
      console.warn('📦 Bucket exists but cannot be accessed - permissions issue');
      return false;
    }
    
    // El bucket probablemente no existe o hay problemas de permisos
    // Usamos reset_menu_images_permissions para reiniciar permisos/crear bucket
    try {
      const { data, error } = await supabase.rpc('reset_menu_images_permissions');
      if (error) throw error;
      console.log('📦 Permisos de bucket reiniciados correctamente');
      return true;
    } catch (rpcError) {
      console.error('📦 Error al intentar reiniciar permisos:', rpcError);
      return false;
    }
  } catch (error) {
    console.error('📦 Error verifying bucket:', error);
    return false;
  }
};

/**
 * Sube una imagen con manejo mejorado de errores y URLs simples
 */
export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  if (!file) {
    toast.error("No se seleccionó ningún archivo");
    return null;
  }

  // Validaciones básicas
  if (file.size > 5 * 1024 * 1024) {
    toast.error("La imagen no debe superar los 5MB");
    return null;
  }

  const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validFormats.includes(file.type)) {
    toast.error("Formato de imagen no válido. Use JPG, PNG, GIF o WebP");
    return null;
  }

  try {
    // Verificamos que el bucket exista, pero solo una vez
    await verifyBucketExists();
    
    // Generamos un nombre único para evitar conflictos
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    console.log(`📦 Subiendo imagen: ${uniqueFileName}, tamaño: ${file.size} bytes`);
    
    // Subimos la imagen con configuración para asegurar acceso público
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Aseguramos que el tipo de contenido sea correcto
      });
    
    if (error) {
      console.error('📦 Error al subir imagen:', error);
      toast.error("Error al subir imagen. Intente nuevamente");
      return null;
    }
    
    if (!data || !data.path) {
      toast.error("Error al procesar imagen subida");
      return null;
    }
    
    // Obtenemos la URL pública DIRECTA sin transformaciones ni parámetros adicionales
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      toast.error("Error al generar URL pública para la imagen");
      return null;
    }
    
    // URL pública sin parámetros extras
    const publicUrl = publicUrlData.publicUrl;
    console.log('📦 URL pública generada:', publicUrl);
    
    // Verificamos que la URL sea accesible enviando una solicitud HEAD
    try {
      const response = await fetch(publicUrl, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        console.warn(`📦 URL pública no accesible, código: ${response.status}`);
        if (response.status === 403) {
          console.error('📦 Error de permisos (403) al acceder a la imagen. Verificar políticas de bucket.');
        }
      } else {
        console.log('📦 URL verificada correctamente, código:', response.status);
      }
    } catch (e) {
      console.warn('📦 No se pudo verificar accesibilidad de URL:', e);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('📦 Error general en uploadMenuItemImage:', error);
    toast.error("Error inesperado al subir imagen");
    return null;
  }
};

/**
 * Elimina una imagen con validación robusta
 */
export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    // Extraemos el nombre del archivo de la URL
    const urlObj = new URL(imageUrl);
    const pathParts = urlObj.pathname.split('/');
    // El último segmento del path debería ser el nombre del archivo
    const fileName = pathParts[pathParts.length - 1];
    
    if (!fileName) {
      console.error('📦 Nombre de archivo no válido en URL:', imageUrl);
      return false;
    }
    
    console.log('📦 Eliminando imagen:', fileName);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);
    
    if (error) {
      console.error('📦 Error al eliminar imagen:', error);
      toast.error('Error al eliminar la imagen');
      return false;
    }
    
    console.log('📦 Imagen eliminada correctamente');
    return true;
  } catch (error) {
    console.error('📦 Error en deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen');
    return false;
  }
};

/**
 * Inicialización simple que solo verifica acceso al bucket
 * Esta función solo debe llamarse en la carga inicial
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    console.log('📦 Iniciando verificación de acceso al bucket...');
    // Verificar si el bucket existe y tenemos acceso
    const hasAccess = await verifyBucketExists();
    
    if (!hasAccess) {
      console.warn('📦 No se pudo verificar acceso al bucket menu_images');
      toast.error("Error de almacenamiento. Esto puede afectar la carga de imágenes.");
    } else {
      console.log('📦 Acceso al bucket verificado correctamente');
    }
    
    return hasAccess;
  } catch (error) {
    console.error('📦 Error en initializeStorage:', error);
    return false;
  }
};

// Sin cache busting ni parámetros extra para evitar problemas
export const getImageUrlWithCacheBusting = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Retornamos la URL original sin parámetros para máxima compatibilidad
  return imageUrl;
};
