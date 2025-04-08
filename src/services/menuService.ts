
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
    // Crear un nombre de archivo único que preserve la extensión original
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    console.log(`Uploading file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    console.log(`Generated filename: ${uniqueFileName}`);
    
    // Primero intentar crear el bucket si no existe
    try {
      const { data: createBucketData, error: createBucketError } = await supabase
        .storage
        .createBucket('menu_images', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
        });
      
      if (!createBucketError) {
        console.log('Bucket created or already exists:', createBucketData);
      }
    } catch (bucketError) {
      console.log('Bucket probably already exists or cannot be created now:', bucketError);
      // Continuar de todos modos
    }
    
    // Verificar que el bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw new Error('Error al verificar buckets de almacenamiento');
    }
    
    const menuBucketExists = buckets.some(bucket => bucket.name === 'menu_images');
    console.log('menu_images bucket exists:', menuBucketExists);
    
    if (!menuBucketExists) {
      toast.error('El bucket de imágenes no existe. Por favor contacte al administrador.');
      throw new Error('El bucket menu_images no existe');
    }
    
    // Subir la imagen
    const { data, error } = await supabase
      .storage
      .from('menu_images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading menu item image:', error);
      throw error;
    }

    console.log('Upload successful. Path:', data?.path);
    
    // Obtener la URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from('menu_images')
      .getPublicUrl(data.path);
    
    console.log('Public URL:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadMenuItemImage:', error);
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
    
    console.log('Attempting to delete image:', fileName, 'from bucket:', bucketName);
    
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting menu item image:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen del menú');
    return false;
  }
};

// Agregar una función para verificar el estado del storage
export const verifyStorageConnection = async (): Promise<boolean | { connected: boolean, message: string }> => {
  try {
    console.log('Verificando conexión de almacenamiento y buckets...');
    
    // Primero, intentar crear el bucket si no existe
    try {
      const { data: createBucketData, error: createBucketError } = await supabase
        .storage
        .createBucket('menu_images', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
        });
      
      if (!createBucketError) {
        console.log('Bucket created successfully or already exists:', createBucketData);
      } else {
        console.error('Error creating bucket:', createBucketError);
      }
    } catch (bucketError) {
      console.error('Error attempting to create bucket:', bucketError);
    }
    
    // Esperar un momento para que se propague la creación del bucket
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Intenta listar los buckets para verificar la conexión
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error verifying storage connection:', error);
      return { 
        connected: false,
        message: `Error de conexión: ${error.message}`
      };
    }
    
    console.log("Buckets encontrados:", data);
    
    // Buscar el bucket de imágenes de menú
    const menuImagesBucket = data.find(bucket => bucket.name === 'menu_images');
    
    if (!menuImagesBucket) {
      console.warn('Menu images bucket not found');
      
      // Intentar crear el bucket nuevamente
      try {
        const { error: retryError } = await supabase.storage.createBucket('menu_images', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
        });
        
        if (retryError) {
          console.error('Error creating bucket on retry:', retryError);
          return { 
            connected: false,
            message: 'No se pudo crear el bucket "menu_images". Error: ' + retryError.message
          };
        }
        
        console.log('Bucket created on retry');
        
        // Verificar si ahora existe el bucket
        const { data: retryData, error: retryListError } = await supabase.storage.listBuckets();
        
        if (retryListError) {
          return { 
            connected: false,
            message: 'Error al verificar la creación del bucket: ' + retryListError.message 
          };
        }
        
        const bucketExists = retryData.some(bucket => bucket.name === 'menu_images');
        if (!bucketExists) {
          return { 
            connected: false,
            message: 'El bucket "menu_images" no pudo ser creado. Intente recargar la página.' 
          };
        }
      } catch (retryCreateError) {
        console.error('Error on bucket create retry:', retryCreateError);
        return { 
          connected: false,
          message: 'Error al intentar crear el bucket: ' + (retryCreateError.message || retryCreateError) 
        };
      }
    }
    
    // Probar que podemos listar contenido del bucket
    const { data: files, error: listError } = await supabase.storage
      .from('menu_images')
      .list();
      
    if (listError) {
      console.error('Error listing files from menu_images bucket:', listError);
      return { 
        connected: false,
        message: `El bucket existe pero no se puede acceder: ${listError.message}` 
      };
    }
    
    console.log('Storage connection verified, menu_images bucket exists with', files?.length || 0, 'files');
    
    // Comprobar RLS policies para el bucket
    try {
      // Intentar subir un archivo de prueba pequeño para verificar permisos
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'connection_test.txt');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu_images')
        .upload('connection_test.txt', testFile, { upsert: true });
        
      if (uploadError) {
        console.error('Error on test upload (permissions check):', uploadError);
        return {
          connected: true,
          message: 'Bucket accesible pero posible problema de permisos: ' + uploadError.message
        };
      }
      
      // Eliminar el archivo de prueba
      await supabase.storage
        .from('menu_images')
        .remove(['connection_test.txt']);
        
      console.log('Permissions check passed successfully');
    } catch (permissionsError) {
      console.error('Error checking permissions:', permissionsError);
    }
    
    return { connected: true, message: 'Conexión al almacenamiento verificada correctamente' };
  } catch (error) {
    console.error('Error in verifyStorageConnection:', error);
    return { 
      connected: false, 
      message: `Error inesperado al verificar la conexión: ${error.message || error}` 
    };
  }
};
