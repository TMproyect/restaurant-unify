
import { supabase } from "@/integrations/supabase/client";
import { filterValue, mapArrayResponse, mapSingleResponse } from "@/utils/supabaseHelpers";

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
  return mapArrayResponse<InventoryItem>(data, 'Failed to fetch inventory items');
};

// Fetch inventory categories
export const fetchInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*');
    
  if (error) throw error;
  return mapArrayResponse<InventoryCategory>(data, 'Failed to fetch inventory categories');
};

// Create a new inventory item
export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item as any])
    .select();
    
  if (error) throw error;
  return mapSingleResponse<InventoryItem>(data[0], 'Failed to create inventory item');
};

// Update an inventory item
export const updateInventoryItem = async (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'created_at'>>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates as any)
    .eq('id', filterValue(id))
    .select();
    
  if (error) throw error;
  return mapSingleResponse<InventoryItem>(data[0], 'Failed to update inventory item');
};

// Delete an inventory item
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', filterValue(id));
    
  if (error) throw error;
  return true;
};

// Update inventory item stock
export const updateInventoryItemStock = async (id: string, newQuantity: number): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ stock_quantity: newQuantity } as any)
    .eq('id', filterValue(id))
    .select();
    
  if (error) throw error;
  return mapSingleResponse<InventoryItem>(data[0], 'Failed to update inventory stock');
};

// Create a new inventory category
export const createInventoryCategory = async (name: string): Promise<InventoryCategory> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .insert([{ name } as any])
    .select();
    
  if (error) throw error;
  return mapSingleResponse<InventoryCategory>(data[0], 'Failed to create inventory category');
};

// Update an inventory category
export const updateInventoryCategory = async (id: string, name: string): Promise<InventoryCategory> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .update({ name } as any)
    .eq('id', filterValue(id))
    .select();
    
  if (error) throw error;
  return mapSingleResponse<InventoryCategory>(data[0], 'Failed to update inventory category');
};

// Delete an inventory category
export const deleteInventoryCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory_categories')
    .delete()
    .eq('id', filterValue(id));
    
  if (error) throw error;
  return true;
};

// Get low stock items
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, category:category_id(id, name)')
    .lt('stock_quantity', 'min_stock_level')
    .gt('stock_quantity', 0);
    
  if (error) throw error;
  return mapArrayResponse<InventoryItem>(data, 'Failed to get low stock items');
};

// Get out of stock items
export const getOutOfStockItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, category:category_id(id, name)')
    .lte('stock_quantity', 0);
    
  if (error) throw error;
  return mapArrayResponse<InventoryItem>(data, 'Failed to get out of stock items');
};
