import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

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
    console.log('🍽️ Creando nuevo ítem del menú:', { 
      ...item, 
      image_url: item.image_url ? `[Base64 Image: ${item.image_url.substring(0, 30)}...]` : undefined 
    });
    
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
    
    console.log('🍽️ Enviando datos a la base de datos (imagen incluida como Base64):', item);
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('🍽️ Error al crear ítem del menú:', error);
      throw error;
    }

    console.log('🍽️ Ítem creado exitosamente:', { 
      ...data, 
      image_url: data.image_url ? '[Base64 Image Data]' : undefined 
    });
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

export const deleteMenuItem = async (id: string, forceDelete: boolean = false): Promise<boolean> => {
  try {
    // Primero verificamos si el ítem está referenciado en order_items
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
    
    // Finalmente eliminamos el ítem del menú
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
