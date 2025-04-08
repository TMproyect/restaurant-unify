
import { supabase } from '@/integrations/supabase/client';

// Interfaz para los items de inventario
export interface InventoryItem {
  id: string;
  name: string;
  category_id: string | null;
  stock_quantity: number;
  min_stock_level: number | null;
  unit: string | null;
  created_at: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  created_at: string;
}

// Obtener todos los items del inventario
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener items de inventario:', error);
    throw error;
  }
};

// Obtener items con stock bajo
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  try {
    // Corregir la consulta para comparar correctamente min_stock_level
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .not('min_stock_level', 'is', null)  // Solo items con min_stock_level definido
      .filter('stock_quantity', 'lt', 'min_stock_level')  // Usar el filtro correcto para comparación numérica
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener items con stock bajo:', error);
    throw error;
  }
};

// Obtener categorías de inventario
export const getInventoryCategories = async (): Promise<InventoryCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener categorías de inventario:', error);
    throw error;
  }
};

// Crear un nuevo item de inventario
export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<InventoryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear item de inventario:', error);
    throw error;
  }
};

// Actualizar un item de inventario existente
export const updateInventoryItem = async (id: string, item: Partial<Omit<InventoryItem, 'id' | 'created_at'>>): Promise<InventoryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar item de inventario:', error);
    throw error;
  }
};

// Eliminar un item de inventario
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar item de inventario:', error);
    throw error;
  }
};

// Crear una nueva categoría de inventario
export const createInventoryCategory = async (name: string): Promise<InventoryCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear categoría de inventario:', error);
    throw error;
  }
};

// Actualizar una categoría de inventario
export const updateInventoryCategory = async (id: string, name: string): Promise<InventoryCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar categoría de inventario:', error);
    throw error;
  }
};

// Eliminar una categoría de inventario
export const deleteInventoryCategory = async (id: string): Promise<boolean> => {
  try {
    // Primero actualizar items que usen esta categoría
    await supabase
      .from('inventory_items')
      .update({ category_id: null })
      .eq('category_id', id);
    
    // Luego eliminar la categoría
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar categoría de inventario:', error);
    throw error;
  }
};
