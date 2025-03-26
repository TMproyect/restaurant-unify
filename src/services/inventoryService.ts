
import { supabase } from "@/integrations/supabase/client";

export interface InventoryItem {
  id: string;
  name: string;
  category_id?: string;
  stock_quantity: number;
  min_stock_level?: number;
  unit?: string;
  created_at: string;
  // Add a field to store the joined category
  category?: {
    id: string;
    name: string;
  };
}

export interface InventoryCategory {
  id: string;
  name: string;
  created_at: string;
}

// Fetch all inventory items
export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, category:category_id(id, name)');
    
  if (error) throw error;
  return data;
};

// Fetch inventory categories
export const fetchInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*');
    
  if (error) throw error;
  return data;
};

// Create a new inventory item
export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(item)
    .select();
    
  if (error) throw error;
  return data[0];
};

// Update an inventory item
export const updateInventoryItem = async (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'created_at'>>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

// Delete an inventory item
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};
