
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Función principal para inicializar y verificar el bucket de almacenamiento
export const initializeStorageBucket = async (forceRecreate: boolean = false): Promise<boolean> => {
  try {
    console.log('📦 Inicializando bucket de almacenamiento...');
    
    // Llamar a la función Edge storage-reinitialize que ahora no requiere JWT
    console.log('📦 Invocando función Edge storage-reinitialize...');
    
    const { data, error } = await supabase.functions.invoke('storage-reinitialize');
    
    if (error) {
      console.error('📦 Error al llamar función Edge:', error);
      return false;
    }
    
    console.log('📦 Respuesta de función Edge:', data);
    
    if (data && data.success) {
      console.log('📦 Bucket inicializado correctamente por Edge Function');
      
      // Verificar acceso al bucket
      try {
        console.log('📦 Verificando acceso al bucket menu_images...');
        const { data: files, error: listError } = await supabase.storage
          .from('menu_images')
          .list('', { limit: 1 });
        
        if (listError) {
          console.error('📦 Error al listar archivos del bucket:', listError);
        } else {
          console.log('📦 El bucket es accesible, archivos encontrados:', files?.length || 0);
        }
      } catch (testError) {
        console.error('📦 Error al verificar acceso al bucket:', testError);
      }
      
      return true;
    } else {
      console.error('📦 La función Edge no reportó éxito:', data);
      return false;
    }
  } catch (error) {
    console.error('📦 Error general en initializeStorageBucket:', error);
    return false;
  }
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
      
      console.log('📦 URL pública obtenida:', publicUrlData.publicUrl);
      
      // Verificar que la URL sea accesible
      try {
        const response = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
        console.log('📦 Verificación de URL pública:', response.status);
        
        // Si la URL no es accesible (404, 403, etc.), mostrar advertencia pero devolver la URL de todos modos
        if (!response.ok) {
          console.warn('📦 La URL pública puede no ser accesible:', response.status);
          toast.warning("La imagen se subió pero puede tardar unos momentos en estar visible");
        }
      } catch (verifyError) {
        console.warn('📦 No se pudo verificar la URL pública:', verifyError);
      }
      
      return publicUrlData.publicUrl;
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
  toast.error('No se pudo subir la imagen después de varios intentos. Intente usar el botón "Sincronizar Imágenes" y luego subir nuevamente.');
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
