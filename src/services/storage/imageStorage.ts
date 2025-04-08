
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Centralized function for initializing storage bucket automatically
export const initializeStorageBucket = async (forceRecreate: boolean = false): Promise<void> => {
  try {
    console.log('📦 Inicializando bucket de almacenamiento...');
    
    // Llamar a la función Edge storage-reinitialize que ahora no requiere JWT
    try {
      console.log('📦 Invocando función Edge storage-reinitialize...');
      const { data, error } = await supabase.functions.invoke('storage-reinitialize');
      
      if (error) {
        console.error('📦 Error al llamar función Edge:', error);
      } else {
        console.log('📦 Respuesta de función Edge:', data);
        if (data && data.success) {
          console.log('📦 Bucket inicializado correctamente por Edge Function');
          // Continuamos con el resto de la función para tener un enfoque de redundancia
        }
      }
    } catch (edgeFunctionError) {
      console.error('📦 Error al invocar Edge Function:', edgeFunctionError);
    }
    
    // Intentar verificar y asegurar que el bucket exista localmente
    try {
      console.log('📦 Verificando acceso al bucket menu_images...');
      const { data: files, error: listError } = await supabase.storage
        .from('menu_images')
        .list();
      
      if (listError) {
        console.error('📦 Error al listar archivos del bucket:', listError);
      } else {
        console.log('📦 El bucket parece estar accesible, archivos:', files?.length || 0);
      }
    } catch (testError) {
      console.error('📦 Error al probar acceso al bucket:', testError);
    }
    
    // Registrar el estatus de inicialización en system_settings
    try {
      console.log('📦 Registrando estado de inicialización...');
      const { error: settingsError } = await supabase.from('system_settings')
        .upsert([{ 
          key: 'menu_images_bucket_status', 
          value: JSON.stringify({
            initialized: true,
            updated_at: new Date().toISOString()
          })
        }]);
      
      if (settingsError) {
        console.error('📦 Error al registrar estado del bucket:', settingsError);
      }
    } catch (settingsError) {
      console.error('📦 Error al actualizar settings:', settingsError);
    }
  } catch (error) {
    console.error('📦 Error general en initializeStorageBucket:', error);
  }
};

export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  console.log('📦 Iniciando proceso de subida de imagen...');
  console.log(`📦 Archivo a subir: ${file.name}, Tamaño: ${file.size} bytes, Tipo: ${file.type}`);
  
  try {
    // Inicializar bucket automáticamente sin preguntar al usuario
    console.log('📦 Inicializando bucket de almacenamiento antes de subir...');
    await initializeStorageBucket();
    
    // Crear un nombre de archivo único que preserve la extensión original
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    console.log(`📦 Nombre de archivo generado: ${uniqueFileName}`);
    
    // Intentar subir el archivo
    console.log('📦 Subiendo archivo...');
    const { data, error } = await supabase.storage
      .from('menu_images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('📦 Error al subir archivo:', error);
      throw error;
    }
    
    if (!data || !data.path) {
      throw new Error('No se recibió información del archivo subido');
    }
    
    console.log('📦 Archivo subido exitosamente. Ruta:', data.path);
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('menu_images')
      .getPublicUrl(data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo');
    }
    
    console.log('📦 URL pública obtenida:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('📦 Error en uploadMenuItemImage:', error);
    
    // Intentar una vez más con el método de Edge Function
    try {
      console.log('📦 Intentando reinicializar bucket vía Edge Function y reintentar...');
      
      // Llamar explícitamente a la Edge Function
      const { error: edgeError } = await supabase.functions.invoke('storage-reinitialize');
      
      if (edgeError) {
        console.error('📦 Error al llamar Edge Function en reintento:', edgeError);
      } else {
        console.log('📦 Edge Function ejecutada correctamente en reintento');
        
        // Esperar un momento para que se apliquen los cambios
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Crear nombre único de archivo para el segundo intento
        const uniqueFileName = `retry_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        // Reintentar subida
        const { data: retryData, error: retryError } = await supabase.storage
          .from('menu_images')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (retryError) {
          console.error('📦 Error en segundo intento de subida:', retryError);
        } else if (retryData && retryData.path) {
          console.log('📦 Segundo intento exitoso. Ruta:', retryData.path);
          
          // Obtener URL pública del segundo intento
          const { data: retryUrlData } = supabase.storage
            .from('menu_images')
            .getPublicUrl(retryData.path);
          
          if (retryUrlData && retryUrlData.publicUrl) {
            console.log('📦 URL pública del segundo intento:', retryUrlData.publicUrl);
            return retryUrlData.publicUrl;
          }
        }
      }
    } catch (retryError) {
      console.error('📦 Error en segundo intento completo:', retryError);
    }
    
    toast.error('Error al subir la imagen. Intente usar el botón "Sincronizar Imágenes" y luego subir nuevamente.');
    return null;
  }
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
      throw error;
    }
    
    console.log('📦 Imagen eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('📦 Error en deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen del menú');
    return false;
  }
};

// Exportamos la función para uso directo
export const initializeStorage = initializeStorageBucket;
