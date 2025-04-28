import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';
import { uploadMenuItemImage, deleteMenuItemImage, migrateBase64ToStorage } from '../storage/imageStorage';

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

export interface MenuItemQueryOptions {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Obtiene elementos del menú con opciones de paginación y filtrado
 */
export const fetchMenuItems = async (options: MenuItemQueryOptions = {}): Promise<{
  items: MenuItem[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      categoryId,
      searchTerm,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;
    
    // Calcular índices para paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Construir la consulta base
    let query = supabase
      .from('menu_items')
      .select('*', { count: 'exact' });
    
    // Agregar filtros si se proporcionan
    if (categoryId) {
      query = query.eq('category_id', filterValue(categoryId));
    }
    
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    // Obtener count antes de aplicar paginación
    const { count, error: countError } = await query;
    
    if (countError) {
      console.error('Error obteniendo conteo de elementos:', countError);
      throw countError;
    }
    
    // Aplicar ordenación y paginación
    const { data, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) {
      console.error('Error obteniendo elementos del menú:', error);
      throw error;
    }
    
    const total = count || 0;
    const items = mapArrayResponse<MenuItem>(data, 'Error mapeando elementos del menú');
    
    return {
      items,
      total,
      hasMore: from + items.length < total
    };
  } catch (error) {
    console.error('Error en fetchMenuItems:', error);
    toast.error('Error al cargar los elementos del menú');
    return { items: [], total: 0, hasMore: false };
  }
};

/**
 * Crea un nuevo elemento del menú
 */
export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> => {
  try {
    console.log('🍽️ Creando nuevo ítem del menú:', { 
      ...item, 
      image_url: item.image_url ? 'Imagen proporcionada' : undefined
    });
    
    // Verificar SKU único
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
    }
    
    // Procesar imagen - Migrar a Storage si es Base64
    let finalImageUrl = item.image_url;
    if (item.image_url?.startsWith('data:image/')) {
      try {
        const storageUrl = await migrateBase64ToStorage(item.image_url);
        if (storageUrl !== item.image_url) {
          console.log('🍽️ Imagen migrada correctamente a Storage');
          finalImageUrl = storageUrl;
        }
      } catch (imageError) {
        console.error('🍽️ Error migrando imagen a Storage:', imageError);
        // Continuar con Base64 si falla la migración
      }
    }
    
    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ ...item, image_url: finalImageUrl }])
      .select()
      .single();

    if (error) {
      console.error('🍽️ Error al crear ítem del menú:', error);
      throw error;
    }

    console.log('🍽️ Ítem creado exitosamente');
    return mapSingleResponse<MenuItem>(data, 'Error mapeando ítem creado');
  } catch (error) {
    console.error('🍽️ Error en createMenuItem:', error);
    toast.error('Error al crear el elemento del menú');
    return null;
  }
};

/**
 * Actualiza un elemento existente del menú
 */
export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  try {
    // Verificar SKU único
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
    
    // Procesar imagen - Migrar a Storage si es Base64
    let finalUpdates = { ...updates };
    if (updates.image_url?.startsWith('data:image/')) {
      try {
        // Obtener imagen actual para borrarla si es necesario
        const { data: currentItem } = await supabase
          .from('menu_items')
          .select('image_url')
          .eq('id', id)
          .single();
          
        if (currentItem?.image_url && !currentItem.image_url.startsWith('data:image/')) {
          // Borrar la imagen anterior en Storage
          await deleteMenuItemImage(currentItem.image_url);
        }
        
        const storageUrl = await migrateBase64ToStorage(updates.image_url);
        if (storageUrl !== updates.image_url) {
          console.log('🍽️ Imagen migrada correctamente a Storage');
          finalUpdates.image_url = storageUrl;
        }
      } catch (imageError) {
        console.error('🍽️ Error migrando imagen a Storage:', imageError);
        // Continuar con Base64 si falla la migración
      }
    }
    
    const updatesWithTimestamp = {
      ...finalUpdates,
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

/**
 * Elimina un elemento del menú y su imagen asociada
 */
export const deleteMenuItem = async (id: string, forceDelete: boolean = false): Promise<boolean> => {
  try {
    // Verificar si hay referencias en órdenes
    const { data: orderItems, error: checkError } = await supabase
      .from('order_items')
      .select('id, order_id')
      .eq('menu_item_id', filterValue(id));
    
    if (checkError) {
      console.error('Error checking order items references:', checkError);
      toast.error('Error al verificar si el plato se puede eliminar');
      return false;
    }
    
    // Si el ítem está siendo usado en pedidos y no se forzó la eliminación
    if (orderItems && orderItems.length > 0 && !forceDelete) {
      console.log(`⚠️ No se puede eliminar el plato porque está referenciado en ${orderItems.length} pedidos`);
      toast.error('No se puede eliminar este plato porque está siendo usado en pedidos. Considere marcarlo como no disponible en su lugar.');
      return false;
    }
    
    // Obtener la URL de la imagen para eliminarla después
    const { data: item } = await supabase
      .from('menu_items')
      .select('image_url')
      .eq('id', filterValue(id))
      .maybeSingle();
    
    const imageUrl = item?.image_url;
    
    // Si se fuerza la eliminación, eliminamos primero las referencias en order_items
    if (forceDelete && orderItems && orderItems.length > 0) {
      console.log(`🗑️ Eliminando ${orderItems.length} referencias en order_items...`);
      
      // Extraemos IDs únicos de órdenes que contienen este ítem de menú
      const orderIds = [...new Set(orderItems.map(item => item.order_id))];
      console.log(`🗑️ Afecta a ${orderIds.length} órdenes distintas`);
      
      // Primero eliminamos los items de la orden
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('menu_item_id', filterValue(id));
      
      if (deleteItemsError) {
        console.error('Error eliminando items de pedidos:', deleteItemsError);
        toast.error('Error al eliminar las referencias del plato en pedidos');
        return false;
      }
      
      console.log('✅ Referencias en order_items eliminadas correctamente');
      
      // Luego actualizamos el contador y total de cada orden afectada
      for (const orderId of orderIds) {
        // Recalcular items_count y total para esta orden
        const { data: remainingItems, error: countError } = await supabase
          .from('order_items')
          .select('price, quantity')
          .eq('order_id', orderId);
        
        if (countError) {
          console.error(`Error al obtener items restantes para orden ${orderId}:`, countError);
          continue;
        }
        
        const itemsCount = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Actualizar la orden con los nuevos valores
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            items_count: itemsCount,
            total: total,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        
        if (updateError) {
          console.error(`Error al actualizar orden ${orderId}:`, updateError);
        }
      }
      
      console.log('✅ Órdenes actualizadas correctamente');
    }
    
    // Eliminar el ítem del menú
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', filterValue(id));

    if (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
    
    // Eliminar la imagen asociada si existe y no es Base64
    if (imageUrl && !imageUrl.startsWith('data:image/')) {
      await deleteMenuItemImage(imageUrl);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    toast.error('Error al eliminar el elemento del menú');
    return false;
  }
};

/**
 * Migra todas las imágenes Base64 existentes a Supabase Storage
 */
export const migrateAllBase64Images = async (): Promise<boolean> => {
  try {
    // Obtener todos los items con imágenes Base64
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, image_url')
      .ilike('image_url', 'data:image/%');
    
    if (error) {
      console.error('Error obteniendo imágenes Base64:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('No hay imágenes Base64 para migrar');
      return true;
    }
    
    console.log(`Migrando ${data.length} imágenes Base64 a Storage`);
    
    // Procesar cada imagen
    let successCount = 0;
    for (const item of data) {
      if (item.image_url && item.image_url.startsWith('data:image/')) {
        try {
          const storageUrl = await migrateBase64ToStorage(item.image_url);
          
          if (storageUrl !== item.image_url) {
            // Actualizar el ítem con la nueva URL
            const { error: updateError } = await supabase
              .from('menu_items')
              .update({ 
                image_url: storageUrl,
                updated_at: new Date().toISOString() 
              })
              .eq('id', item.id);
              
            if (!updateError) {
              successCount++;
            } else {
              console.error(`Error actualizando imagen para item ${item.id}:`, updateError);
            }
          }
        } catch (migrationError) {
          console.error(`Error migrando imagen para item ${item.id}:`, migrationError);
        }
      }
    }
    
    console.log(`Migración completada: ${successCount}/${data.length} imágenes migradas exitosamente`);
    return successCount > 0;
  } catch (error) {
    console.error('Error en migrateAllBase64Images:', error);
    return false;
  }
};

// Función para obtener un solo ítem del menú por ID
export const getMenuItemById = async (id: string): Promise<MenuItem | null> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', filterValue(id))
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
    
    return mapSingleResponse<MenuItem>(data, 'Failed to map menu item');
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    return null;
  }
};
