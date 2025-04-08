
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
    if (item.sku) {
      const { data: existingSku, error: skuError } = await supabase
        .from('menu_items')
        .select('sku')
        .eq('sku', item.sku)
        .maybeSingle();
      
      if (existingSku) {
        toast.error(`El SKU "${item.sku}" ya está en uso por otro producto.`);
        return null;
      }
    }
    
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }

    return mapSingleResponse<MenuItem>(data, 'Failed to map created menu item');
  } catch (error) {
    console.error('Error in createMenuItem:', error);
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
  try {
    // Verificar primero la conexión de almacenamiento
    const storageStatus = await verifyStorageConnection(true);
    console.log('📦 Estado de almacenamiento antes de subir:', storageStatus);
    
    if (!storageStatus || (typeof storageStatus === 'object' && !storageStatus.connected)) {
      console.error('📦 No se puede subir la imagen, almacenamiento no disponible');
      toast.error('No se pudo subir la imagen. El sistema de almacenamiento no está disponible.');
      return null;
    }
    
    // Crear un nombre de archivo único que preserve la extensión original
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    console.log(`📦 Subiendo archivo: ${file.name}, Tamaño: ${file.size} bytes, Tipo: ${file.type}`);
    console.log(`📦 Nombre de archivo generado: ${uniqueFileName}`);
    
    // Subir la imagen
    const { data, error } = await supabase
      .storage
      .from('menu_images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('📦 Error al subir imagen:', error);
      
      // Si hay un error, intentar recrear el bucket y volver a intentar
      await verifyStorageConnection(true);
      
      // Segundo intento después de verificar/crear el bucket
      console.log('📦 Segundo intento de subida después de verificar bucket');
      const secondAttempt = await supabase
        .storage
        .from('menu_images')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (secondAttempt.error) {
        console.error('📦 Error en segundo intento de subida:', secondAttempt.error);
        throw secondAttempt.error;
      }
      
      data = secondAttempt.data;
    }

    if (!data || !data.path) {
      throw new Error('No se recibió información del archivo subido');
    }

    console.log('📦 Subida exitosa. Ruta:', data?.path);
    
    // Obtener la URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from('menu_images')
      .getPublicUrl(data.path);
    
    console.log('📦 URL pública:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('📦 Error en uploadMenuItemImage:', error);
    toast.error('Error al subir la imagen del menú');
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

    return true;
  } catch (error) {
    console.error('📦 Error en deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen del menú');
    return false;
  }
};

// Verificación y creación del bucket de almacenamiento
export const verifyStorageConnection = async (forceCreate: boolean = false): Promise<boolean | { connected: boolean, message: string }> => {
  try {
    console.log('📦 Verificando conexión de almacenamiento...');
    console.log('📦 forceCreate:', forceCreate);
    
    // Verificar si el usuario está autenticado para operaciones de almacenamiento
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('📦 No hay sesión de usuario activa, algunas operaciones pueden fallar');
    } else {
      console.log('📦 Usuario autenticado:', session.user.id);
    }
    
    // Intento 1: Comprobar si el bucket existe
    console.log('📦 Paso 1: Verificando si existe el bucket menu_images');
    let { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('📦 Error al listar buckets:', bucketsError);
      return { 
        connected: false,
        message: `Error al verificar buckets: ${bucketsError.message}` 
      };
    }
    
    console.log('📦 Buckets encontrados:', buckets?.map(b => b.name) || []);
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'menu_images');
    console.log('📦 ¿Existe bucket menu_images?:', bucketExists);
    
    // Si el bucket no existe o forzamos la creación
    if (!bucketExists || forceCreate) {
      try {
        console.log('📦 Paso 2: Intentando crear bucket menu_images');
        const { data: createBucketData, error: createBucketError } = await supabase
          .storage
          .createBucket('menu_images', {
            public: true,
            fileSizeLimit: 20971520, // 20MB
          });
        
        if (createBucketError) {
          console.error('📦 Error al crear bucket:', createBucketError);
          console.log('📦 Código:', createBucketError.code);
          console.log('📦 Mensaje:', createBucketError.message);
          console.log('📦 Detalles:', createBucketError.details);
          
          // Verificar si el error es porque el bucket ya existe
          if (createBucketError.message?.includes('already exists')) {
            console.log('📦 El bucket ya existe, no hay problema');
          } else {
            return { 
              connected: false,
              message: `No se pudo crear el bucket: ${createBucketError.message}` 
            };
          }
        } else {
          console.log('📦 Bucket creado exitosamente:', createBucketData);
        }
        
        // Esperar un momento para que se propague la creación
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar de nuevo si el bucket existe
        console.log('📦 Paso 3: Verificando nuevamente buckets después de creación');
        const { data: bucketsAfterCreate, error: bucketsAfterCreateError } = await supabase.storage.listBuckets();
        
        if (bucketsAfterCreateError) {
          console.error('📦 Error al verificar buckets después de creación:', bucketsAfterCreateError);
        } else {
          console.log('📦 Buckets después de crear:', bucketsAfterCreate?.map(b => b.name) || []);
          const bucketNowExists = bucketsAfterCreate?.some(bucket => bucket.name === 'menu_images');
          console.log('📦 ¿Existe ahora el bucket menu_images?:', bucketNowExists);
        }
      } catch (createError) {
        console.error('📦 Excepción al crear bucket:', createError);
        return { 
          connected: false,
          message: `Error al crear bucket: ${createError.message || createError}` 
        };
      }
    }
    
    // Paso 3: Verificar las políticas de RLS
    try {
      console.log('📦 Paso 4: Probando operaciones en el bucket');
      
      // Crear un pequeño archivo de prueba
      const testContent = 'Test connection ' + new Date().toISOString();
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'connection_test.txt');
      
      console.log('📦 Subiendo archivo de prueba...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu_images')
        .upload('connection_test.txt', testFile, { upsert: true });
        
      if (uploadError) {
        console.error('📦 Error al subir archivo de prueba:', uploadError);
        
        if (uploadError.message?.includes('violated policy')) {
          console.log('📦 El error parece ser de permisos RLS. Verificando políticas...');
          return { 
            connected: false,
            message: `Problema de permisos: ${uploadError.message}`
          };
        }
        
        return { 
          connected: false,
          message: `Error al subir archivo de prueba: ${uploadError.message}`
        };
      }
      
      console.log('📦 Archivo de prueba subido correctamente:', uploadData);
      
      // Probar obtener URL pública
      const { data: urlData } = supabase.storage
        .from('menu_images')
        .getPublicUrl('connection_test.txt');
      
      console.log('📦 URL del archivo de prueba:', urlData?.publicUrl);
      
      // Eliminar el archivo de prueba
      console.log('📦 Eliminando archivo de prueba...');
      await supabase.storage
        .from('menu_images')
        .remove(['connection_test.txt']);
      
      console.log('📦 Pruebas completadas con éxito, el almacenamiento funciona correctamente');
      
      return { 
        connected: true,
        message: 'Conexión al almacenamiento verificada correctamente'
      };
      
    } catch (testError) {
      console.error('📦 Error en pruebas de almacenamiento:', testError);
      return {
        connected: false,
        message: `Error al probar el almacenamiento: ${testError.message || testError}`
      };
    }
  } catch (error) {
    console.error('📦 Error general en verifyStorageConnection:', error);
    return { 
      connected: false, 
      message: `Error inesperado: ${error.message || error}` 
    };
  }
};
