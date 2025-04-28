
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue } from '@/utils/supabaseHelpers';
import { deleteMenuItemImage } from '../../storage/operations/imageManagement';

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
    
    return await handleItemDeletion(id, forceDelete, orderItems, imageUrl);
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    toast.error('Error al eliminar el elemento del menú');
    return false;
  }
};

/**
 * Gestiona la eliminación del ítem y sus referencias
 */
const handleItemDeletion = async (
  id: string, 
  forceDelete: boolean,
  orderItems: any[] | null,
  imageUrl?: string
): Promise<boolean> => {
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
      await updateOrderAfterItemDeletion(orderId);
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
};

/**
 * Actualiza los datos de una orden después de eliminar un ítem
 */
const updateOrderAfterItemDeletion = async (orderId: string): Promise<void> => {
  // Recalcular items_count y total para esta orden
  const { data: remainingItems, error: countError } = await supabase
    .from('order_items')
    .select('price, quantity')
    .eq('order_id', orderId);
  
  if (countError) {
    console.error(`Error al obtener items restantes para orden ${orderId}:`, countError);
    return;
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
};
