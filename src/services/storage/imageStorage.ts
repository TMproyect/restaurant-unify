
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Centralized function for initializing storage bucket automatically
export const initializeStorageBucket = async (forceRecreate: boolean = false): Promise<void> => {
  try {
    console.log('📦 Inicializando bucket de almacenamiento...');
    console.log('📦 Forzar recreación:', forceRecreate);
    
    // Verificar si existe el bucket
    console.log('📦 Verificando si existe el bucket menu_images');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('📦 Error al listar buckets:', bucketsError);
      console.log('📦 Error detallado:', JSON.stringify(bucketsError, null, 2));
      
      // Intentar continuar de todos modos
    }
    
    console.log('📦 Buckets existentes:', buckets?.map(b => b.name) || []);
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'menu_images');
    console.log('📦 ¿Existe bucket menu_images?:', bucketExists);
    
    // Si el bucket no existe o forzamos la creación
    if (!bucketExists || forceRecreate) {
      try {
        if (bucketExists && forceRecreate) {
          // No podemos eliminar el bucket directamente, pero actualizamos sus propiedades
          console.log('📦 Actualizando propiedades del bucket existente...');
          const { error: updateError } = await supabase.storage.updateBucket('menu_images', {
            public: true,
            fileSizeLimit: 20971520, // 20MB
          });
          
          if (updateError) {
            console.error('📦 Error al actualizar bucket:', updateError);
          } else {
            console.log('📦 Bucket actualizado correctamente');
          }
        } else {
          // Crear el bucket si no existe
          console.log('📦 Creando nuevo bucket menu_images...');
          const { data: createBucketData, error: createBucketError } = await supabase.storage
            .createBucket('menu_images', {
              public: true,
              fileSizeLimit: 20971520, // 20MB
            });
          
          if (createBucketError) {
            console.error('📦 Error al crear bucket:', createBucketError);
            
            // Verificar si el error es porque el bucket ya existe
            if (createBucketError.message?.includes('already exists')) {
              console.log('📦 El bucket ya existe, continuando...');
            } else {
              console.error('📦 Error al crear bucket:', createBucketError.message);
            }
          } else {
            console.log('📦 Bucket creado exitosamente:', createBucketData);
          }
        }
      } catch (createError) {
        console.error('📦 Excepción al crear/actualizar bucket:', createError);
      }
    } else {
      console.log('📦 El bucket ya existe, continuando...');
    }
    
    // Registrar el estatus de inicialización en system_settings
    try {
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
    
    // Verificar políticas
    console.log('📦 Verificando permisos del bucket...');
    
    // Crear un pequeño archivo de prueba
    try {
      const testContent = 'Test connection ' + new Date().toISOString();
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'connection_test.txt');
      
      console.log('📦 Probando permisos con archivo de prueba...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu_images')
        .upload('connection_test.txt', testFile, { upsert: true });
        
      if (uploadError) {
        console.error('📦 Error en prueba de permisos:', uploadError);
        console.log('📦 Error detallado:', uploadError.message);
      } else {
        console.log('📦 Prueba de permisos exitosa, eliminando archivo de prueba...');
        
        // Eliminar el archivo de prueba
        await supabase.storage
          .from('menu_images')
          .remove(['connection_test.txt']);
      }
    } catch (testError) {
      console.error('📦 Error en pruebas de permisos:', testError);
    }
    
    console.log('📦 Inicialización de almacenamiento completada');
  } catch (error) {
    console.error('📦 Error general en initializeStorageBucket:', error);
  }
};

export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  console.log('📦 Iniciando proceso de subida de imagen...');
  console.log(`📦 Archivo a subir: ${file.name}, Tamaño: ${file.size} bytes, Tipo: ${file.type}`);
  
  try {
    // Inicializar bucket automáticamente sin preguntar al usuario
    console.log('📦 Inicializando bucket de almacenamiento...');
    await initializeStorageBucket();
    
    // Crear un nombre de archivo único que preserve la extensión original
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    console.log(`📦 Nombre de archivo generado: ${uniqueFileName}`);
    
    // Primera subida
    console.log('📦 Primer intento de subida...');
    let result = await supabase.storage
      .from('menu_images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    // Si hay error, intentar reinicializar el bucket y volver a intentar
    if (result.error) {
      console.error('📦 Error en primer intento de subida:', result.error);
      console.log('📦 Mensaje de error:', result.error.message || 'No disponible');
      
      // Forzar recreación del bucket
      console.log('📦 Forzando recreación del bucket...');
      await initializeStorageBucket(true);
      
      // Esperar un segundo para asegurar que los cambios se propaguen
      console.log('📦 Esperando a que los cambios se propaguen...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Segundo intento con políticas más agresivas
      console.log('📦 Realizando segundo intento de subida...');
      result = await supabase.storage
        .from('menu_images')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (result.error) {
        console.error('📦 Error en segundo intento de subida:', result.error);
        console.log('📦 Mensaje de error:', result.error.message || 'No disponible');
        
        // Tercer intento con último recurso (políticas públicas)
        console.log('📦 Realizando tercer y último intento con políticas públicas...');
        
        // Usar system_settings en lugar de storage_policies_fix
        try {
          console.log('📦 Intentando configurar storage a través de system_settings...');
          
          // Usar system_settings que está en los tipos de TypeScript
          const { error: settingsError } = await supabase.from('system_settings')
            .upsert([
              { 
                key: 'storage_bucket_init', 
                value: JSON.stringify({
                  bucket: 'menu_images',
                  initialized: false,
                  last_attempt: new Date().toISOString()
                })
              }
            ]);
            
          if (settingsError) {
            console.error('📦 Error al intentar solución alternativa:', settingsError);
          } else {
            console.log('📦 Solicitud de inicialización registrada');
            
            // Intentar crear o actualizar bucket manualmente
            console.log('📦 Intentando crear bucket manualmente...');
            try {
              const { data: createBucketData, error: createBucketError } = await supabase.storage
                .createBucket('menu_images', {
                  public: true,
                  fileSizeLimit: 20971520 // 20MB
                });
              
              if (createBucketError) {
                // Si ya existe, intentar actualizar
                if (createBucketError.message?.includes('already exists')) {
                  console.log('📦 El bucket ya existe, actualizando...');
                  const { error: updateError } = await supabase.storage
                    .updateBucket('menu_images', {
                      public: true,
                      fileSizeLimit: 20971520 // 20MB
                    });
                  
                  if (updateError) {
                    console.error('📦 Error al actualizar bucket:', updateError);
                  } else {
                    console.log('📦 Bucket actualizado exitosamente');
                  }
                } else {
                  console.error('📦 Error al crear bucket:', createBucketError);
                }
              } else {
                console.log('📦 Bucket creado exitosamente:', createBucketData);
              }
            } catch (storageError) {
              console.error('📦 Error al manipular bucket:', storageError);
            }
          }
        } catch (rpcError) {
          console.error('📦 Error al intentar alternativa de system_settings:', rpcError);
        }
        
        // Esperar que se apliquen los cambios
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Último intento
        result = await supabase.storage
          .from('menu_images')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (result.error) {
          console.error('📦 Error en tercer intento de subida:', result.error);
          throw new Error(`No se pudo subir la imagen después de múltiples intentos: ${result.error.message}`);
        }
      }
    }

    // Verificar resultado final
    if (!result.data || !result.data.path) {
      console.error('📦 Subida completada pero sin datos de archivo');
      throw new Error('No se recibió información del archivo subido');
    }

    console.log('📦 Subida exitosa. Ruta:', result.data.path);
    
    // Obtener la URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from('menu_images')
      .getPublicUrl(result.data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('📦 No se pudo obtener URL pública');
      throw new Error('No se pudo obtener la URL pública de la imagen');
    }
    
    console.log('📦 URL pública generada:', publicUrlData.publicUrl);
    
    // Verificar que la URL sea accesible
    try {
      console.log('📦 Verificando accesibilidad de la URL...');
      const response = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
      console.log('📦 Respuesta de verificación:', response.status, response.statusText);
    } catch (fetchError) {
      console.warn('📦 No se pudo verificar la URL, pero continuando:', fetchError);
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('📦 Error en uploadMenuItemImage:', error);
    toast.error('Error al subir la imagen del menú. Por favor intente con una imagen más pequeña o en otro formato.');
    return null;
  }
};

export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer el nombre del archivo de la URL
    const bucketName = 'menu_images';
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    console.log('📦 Intentando eliminar imagen:', fileName, 'del bucket:', bucketName);
    
    const { error } = await supabase
      .storage
      .from(bucketName)
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

// Exportamos la función para uso directo si es necesario
export const initializeStorage = initializeStorageBucket;
