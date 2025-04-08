
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
 * Sube una imagen con manejo mejorado de errores - CORREGIDO PARA SOLUCIONAR EL PROBLEMA DE MULTIPART/FORM-DATA
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
    console.log(`📦 Subiendo imagen: ${uniqueFileName}, tamaño: ${file.size} bytes, tipo: ${file.type}`);
    
    // SOLUCIÓN: Reducir al mínimo las opciones y garantizar que el contentType sea correcto
    // El problema estaba en las opciones de subida que causaban que el objeto se sirviera como multipart/form-data
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, file, {
        contentType: file.type // Esto es CRÍTICO para que se sirva correctamente
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
    
    // Obtenemos la URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      toast.error("Error al generar URL pública para la imagen");
      return null;
    }
    
    const publicUrl = publicUrlData.publicUrl;
    console.log('📦 URL pública generada:', publicUrl);
    
    // Verificamos que la URL sea accesible y el tipo de contenido correcto
    try {
      const response = await fetch(publicUrl, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      console.log('📦 Verificación de URL:', response.status, response.ok ? 'OK' : 'Error');
      console.log('📦 Content-Type devuelto:', response.headers.get('content-type'));
      
      if (!response.ok) {
        console.warn('📦 La URL pública no está accesible correctamente');
      }
    } catch (e) {
      console.warn('📦 No se pudo verificar la URL:', e);
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
 * Inicialización simplificada que verifica el bucket
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    console.log('📦 Verificando acceso al bucket menu_images...');
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

// Retornamos la URL original sin modificaciones
export const getImageUrlWithCacheBusting = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  return imageUrl;
};
