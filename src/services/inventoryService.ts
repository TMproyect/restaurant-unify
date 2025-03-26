
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

// Update inventory item stock
export const updateInventoryItemStock = async (id: string, newQuantity: number): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ stock_quantity: newQuantity })
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

// Create a new inventory category
export const createInventoryCategory = async (name: string): Promise<InventoryCategory> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .insert({ name })
    .select();
    
  if (error) throw error;
  return data[0];
};

// Update an inventory category
export const updateInventoryCategory = async (id: string, name: string): Promise<InventoryCategory> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .update({ name })
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

// Delete an inventory category
export const deleteInventoryCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory_categories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// Get low stock items
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, category:category_id(id, name)')
    .lt('stock_quantity', supabase.raw('min_stock_level'))
    .gt('stock_quantity', 0);
    
  if (error) throw error;
  return data;
};

// Get out of stock items
export const getOutOfStockItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, category:category_id(id, name)')
    .lte('stock_quantity', 0);
    
  if (error) throw error;
  return data;
};
