
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Configuración del bucket de almacenamiento
const STORAGE_BUCKET = 'menu_images';

// Función para verificar si existe el bucket
const bucketExists = async (): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    return buckets.some(bucket => bucket.name === STORAGE_BUCKET);
  } catch (error) {
    console.error('Error verificando bucket:', error);
    return false;
  }
};

// Función para crear políticas de acceso público
const createPublicPolicies = async (): Promise<void> => {
  try {
    // Insertar en system_settings para registrar que se intentó crear políticas
    await supabase.from('system_settings')
      .upsert([{ 
        key: 'storage_public_policies', 
        value: JSON.stringify({
          bucket: STORAGE_BUCKET,
          updated_at: new Date().toISOString()
        }) 
      }]);

    console.log('Políticas públicas solicitadas para bucket', STORAGE_BUCKET);
  } catch (error) {
    console.error('Error al solicitar políticas públicas:', error);
  }
};

// Función principal para inicializar el almacenamiento
export const initializeStorage = async (): Promise<void> => {
  try {
    console.log('🚀 Inicializando almacenamiento...');
    
    // Verificar si el bucket existe
    const exists = await bucketExists();
    
    if (!exists) {
      console.log('🚀 El bucket no existe, creándolo...');
      try {
        // Intentar crear el bucket
        const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        
        if (error) {
          console.error('🚀 Error al crear bucket:', error);
          // Solicitar creación de políticas públicas como alternativa
          await createPublicPolicies();
        } else {
          console.log('🚀 Bucket creado exitosamente');
        }
      } catch (error) {
        console.error('🚀 Error al crear bucket:', error);
        await createPublicPolicies();
      }
    } else {
      console.log('🚀 El bucket ya existe');
      
      // Intentar actualizar el bucket para asegurarnos que sea público
      try {
        await supabase.storage.updateBucket(STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        console.log('🚀 Bucket actualizado a público');
      } catch (error) {
        console.error('🚀 Error al actualizar bucket:', error);
      }
    }
    
    console.log('🚀 Inicialización completada');
  } catch (error) {
    console.error('🚀 Error general en inicialización:', error);
  }
};

// Función para subir imágenes de menú
export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  try {
    console.log('🖼️ Subiendo imagen:', file.name, 'Tamaño:', file.size, 'bytes');
    
    // Asegurar que el bucket esté inicializado
    await initializeStorage();
    
    // Generar nombre de archivo único si no se proporciona
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Subir archivo
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(uniqueFileName, file, { 
        cacheControl: '3600',
        upsert: true 
      });
    
    if (error) {
      console.error('🖼️ Error al subir imagen:', error);
      throw error;
    }
    
    if (!data || !data.path) {
      throw new Error('No se recibió información del archivo subido');
    }
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen');
    }
    
    console.log('🖼️ Imagen subida exitosamente:', publicUrlData.publicUrl);
    
    // Verificar que la URL sea accesible
    try {
      const response = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
      console.log('🖼️ Respuesta de verificación:', response.status, response.statusText);
    } catch (error) {
      console.warn('🖼️ No se pudo verificar la URL, pero continuando');
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('🖼️ Error en uploadMenuItemImage:', error);
    toast.error('Error al subir la imagen. Por favor, intenta con una imagen más pequeña o en otro formato.');
    return null;
  }
};

// Función para eliminar imágenes de menú
export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer el nombre del archivo de la URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    console.log('🗑️ Eliminando imagen:', fileName);
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName]);
    
    if (error) {
      console.error('🗑️ Error al eliminar imagen:', error);
      throw error;
    }
    
    console.log('🗑️ Imagen eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('🗑️ Error en deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen');
    return false;
  }
};
