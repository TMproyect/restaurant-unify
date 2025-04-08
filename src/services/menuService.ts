import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  available: boolean;
  popular: boolean;
  allergens?: string[];
  created_at?: string;
  updated_at?: string;
  sku?: string;
}

export const fetchMenuCategories = async (): Promise<MenuCategory[]> => {
  try {
    console.log('Fetching menu categories...');
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching menu categories:', error);
      throw error;
    }

    console.log('Menu categories fetched:', data);
    return mapArrayResponse<MenuCategory>(data, 'Failed to map menu categories');
  } catch (error) {
    console.error('Error in fetchMenuCategories:', error);
    toast.error('Error al cargar las categorías del menú');
    return [];
  }
};

export const createMenuCategory = async (category: { name: string, icon?: string }): Promise<MenuCategory | null> => {
  try {
    console.log('Creating menu category:', category);
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating menu category:', error);
      throw error;
    }

    console.log('Menu category created:', data);
    return mapSingleResponse<MenuCategory>(data, 'Failed to map created category');
  } catch (error) {
    console.error('Error in createMenuCategory:', error);
    toast.error('Error al crear la categoría');
    return null;
  }
};

export const updateMenuCategory = async (id: string, updates: Partial<MenuCategory>): Promise<MenuCategory | null> => {
  try {
    console.log('Updating menu category:', id, updates);
    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', filterValue(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating menu category:', error);
      throw error;
    }

    console.log('Menu category updated:', data);
    return mapSingleResponse<MenuCategory>(data, 'Failed to map updated category');
  } catch (error) {
    console.error('Error in updateMenuCategory:', error);
    toast.error('Error al actualizar la categoría');
    return null;
  }
};

export const deleteMenuCategory = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting menu category:', id);
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', filterValue(id));

    if (error) {
      console.error('Error deleting menu category:', error);
      throw error;
    }

    console.log('Menu category deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteMenuCategory:', error);
    toast.error('Error al eliminar la categoría');
    return false;
  }
};

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }

    return mapArrayResponse<MenuItem>(data, 'Failed to map menu items');
  } catch (error) {
    console.error('Error in fetchMenuItems:', error);
    toast.error('Error al cargar los elementos del menú');
    return [];
  }
};

export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> => {
  try {
    console.log('🍽️ Creando nuevo ítem del menú:', JSON.stringify(item, null, 2));
    
    if (item.sku) {
      console.log('🍽️ Verificando si el SKU ya existe:', item.sku);
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('sku')
        .eq('sku', item.sku)
        .maybeSingle();
      
      if (skuError) {
        console.error('🍽️ Error al verificar SKU:', skuError);
      }
      
      if (existingSku) {
        console.log('🍽️ SKU ya existe:', existingSku);
        toast.error(`El SKU "${item.sku}" ya está en uso por otro producto.`);
        return null;
      }
      
      console.log('🍽️ SKU disponible, continuando...');
    }
    
    console.log('🍽️ Enviando datos a la base de datos:', item);
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('🍽️ Error al crear ítem del menú:', error);
      throw error;
    }

    console.log('🍽️ Ítem creado exitosamente:', data);
    return mapSingleResponse<MenuItem>(data, 'Failed to map created menu item');
  } catch (error) {
    console.error('🍽️ Error en createMenuItem:', error);
    toast.error('Error al crear el elemento del menú');
    return null;
  }
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  try {
    if (updates.sku) {
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('id, sku')
        .eq('sku', updates.sku)
        .neq('id', id)
        .maybeSingle();
      
      if (existingSku) {
        toast.error(`El SKU "${updates.sku}" ya está en uso por otro producto.`);
        return null;
      }
    }
    
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('menu_items')
      .update(updatesWithTimestamp)
      .eq('id', filterValue(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }

    return mapSingleResponse<MenuItem>(data, 'Failed to map updated menu item');
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    toast.error('Error al actualizar el elemento del menú');
    return null;
  }
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', filterValue(id));

    if (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    toast.error('Error al eliminar el elemento del menú');
    return false;
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
        
        // Ejecutar la migración SQL directamente mediante una consulta personalizada
        try {
          console.log('📦 Intentando ejecutar la reinicialización manual del bucket...');
          
          // Usar PostgreSQL directamente en lugar de RPC
          const { error: policyError } = await supabase.from('storage_policies_fix')
            .insert([{ trigger_manual_fix: true }])
            .select()
            .single();
            
          if (policyError) {
            console.error('📦 Error al intentar solución alternativa:', policyError);
          } else {
            console.log('📦 Solución alternativa aplicada');
          }
        } catch (rpcError) {
          console.error('📦 Error al intentar reinicializar políticas:', rpcError);
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

// Función centralizada para inicializar bucket automáticamente
const initializeStorageBucket = async (forceRecreate: boolean = false): Promise<void> => {
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

// Exportamos la función para uso directo si es necesario
export const initializeStorage = initializeStorageBucket;
