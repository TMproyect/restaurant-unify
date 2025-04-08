
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Función principal para inicializar y verificar el bucket de almacenamiento
export const initializeStorageBucket = async (forceRecreate: boolean = false): Promise<boolean> => {
  try {
    console.log('📦 Inicializando bucket de almacenamiento...');
    
    // Llamar a la función Edge storage-reinitialize (sin verificación JWT)
    console.log('📦 Invocando función Edge storage-reinitialize...');
    
    const { data, error } = await supabase.functions.invoke('storage-reinitialize');
    
    if (error) {
      console.error('📦 Error al llamar función Edge:', error);
      
      // Intentar crear el bucket directamente como fallback
      try {
        console.log('📦 Intentando crear bucket directamente...');
        const { error: createError } = await supabase.storage.createBucket('menu_images', {
          public: true
        });
        
        if (createError) {
          console.error('📦 Error al crear bucket directamente:', createError);
        } else {
          console.log('📦 Bucket creado directamente');
        }
      } catch (directError) {
        console.error('📦 Error al crear bucket directamente:', directError);
      }
      
      return false;
    }
    
    console.log('📦 Respuesta de función Edge:', data);
    
    // Aunque haya habido errores específicos, intentamos verificar el acceso para confirmar
    try {
      console.log('📦 Verificando acceso al bucket menu_images...');
      const { data: files, error: listError } = await supabase.storage
        .from('menu_images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('📦 Error al listar archivos del bucket:', listError);
        return false;
      } else {
        console.log('📦 El bucket es accesible, archivos encontrados:', files?.length || 0);
        return true;
      }
    } catch (testError) {
      console.error('📦 Error al verificar acceso al bucket:', testError);
      return false;
    }
  } catch (error) {
    console.error('📦 Error general en initializeStorageBucket:', error);
    return false;
  }
};

// Función para generar URLs públicas absolutas a partir de una URL relativa
const ensureAbsoluteUrl = (url: string): string => {
  if (!url) return '';
  
  // Si ya es una URL completa, devolverla
  if (url.startsWith('http')) return url;
  
  // Construir URL completa utilizando la URL de Supabase
  const baseUrl = "https://imcxvnivqrckgjrimzck.supabase.co";
  return `${baseUrl}/storage/v1/object/public/${url}`;
};

// Función mejorada para subir imágenes con múltiples intentos y mejor manejo de errores
export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  console.log('📦 Iniciando proceso de subida de imagen...');
  console.log(`📦 Archivo a subir: ${file.name}, Tamaño: ${file.size} bytes, Tipo: ${file.type}`);
  
  // Inicializar bucket automáticamente primero
  await initializeStorageBucket();
  
  // Crear un nombre de archivo único
  const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  console.log(`📦 Nombre de archivo generado: ${uniqueFileName}`);
  
  // Intentar la subida con manejo mejorado de errores y reintentos
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`📦 Intento ${attempts} de ${maxAttempts}...`);
    
    try {
      // Subir el archivo
      const { data, error } = await supabase.storage
        .from('menu_images')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`📦 Error en intento ${attempts}:`, error);
        
        // Si es el último intento, reinicializar el bucket y reintentar
        if (attempts === maxAttempts - 1) {
          console.log('📦 Último intento fallido, reinicializando bucket...');
          await initializeStorageBucket(true);
          // Continuar al siguiente intento después de reinicializar
          continue;
        }
        
        // Si no es el último intento, esperar y reintentar
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      if (!data || !data.path) {
        console.error('📦 No se recibió información del archivo subido');
        continue;
      }
      
      console.log('📦 Archivo subido exitosamente. Ruta:', data.path);
      
      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('menu_images')
        .getPublicUrl(data.path);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('📦 No se pudo obtener la URL pública del archivo');
        continue;
      }
      
      const finalUrl = publicUrlData.publicUrl;
      console.log('📦 URL pública obtenida:', finalUrl);
      
      // Verificar que la URL sea accesible
      try {
        const testResponse = await fetch(finalUrl, { method: 'HEAD' });
        console.log('📦 Verificación de URL pública:', testResponse.status);
        
        if (!testResponse.ok) {
          console.warn('📦 La URL pública puede no ser accesible:', testResponse.status);
          
          // Forzar verificación de la imagen cargándola en un elemento Image
          const img = new Image();
          img.src = finalUrl;
          
          // Esperar un pequeño tiempo para que el navegador intente cargar la imagen
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (verifyError) {
        console.warn('📦 No se pudo verificar la URL pública:', verifyError);
      }
      
      return finalUrl;
    } catch (uploadError) {
      console.error(`📦 Error general en intento ${attempts}:`, uploadError);
      
      // Esperar antes del siguiente intento
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  console.error('📦 Todos los intentos de subida fallaron');
  toast.error('No se pudo subir la imagen después de varios intentos.');
  return null;
};

export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer el nombre del archivo de la URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    console.log('📦 Intentando eliminar imagen:', fileName);
    
    const { error } = await supabase.storage
      .from('menu_images')
      .remove([fileName]);
    
    if (error) {
      console.error('📦 Error al eliminar imagen:', error);
      return false;
    }
    
    console.log('📦 Imagen eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('📦 Error en deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen');
    return false;
  }
};

// Exportamos la función para uso directo
export const initializeStorage = initializeStorageBucket;
