
import { supabase } from "@/integrations/supabase/client";

// Fetch all inventory items
export const fetchInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, category_id(id, name)');
    
  if (error) throw error;
  return data;
};

// Fetch inventory categories
export const fetchInventoryCategories = async () => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*');
    
  if (error) throw error;
  return data;
};

// Create a new inventory item
export const createInventoryItem = async (item) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(item)
    .select();
    
  if (error) throw error;
  return data;
};

// Update an inventory item
export const updateInventoryItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data;
};

// Delete an inventory item
export const deleteInventoryItem = async (id) => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};
