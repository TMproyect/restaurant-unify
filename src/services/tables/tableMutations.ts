
import { supabase } from '@/integrations/supabase/client';
import { RestaurantTable, TableZone } from '@/types/tables';
import { filterValue, mapSingleResponse } from '@/utils/supabaseHelpers';

// Restaurant Tables Mutations
export const addRestaurantTable = async (table: Omit<RestaurantTable, 'id' | 'created_at' | 'updated_at'>): Promise<RestaurantTable> => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert([table as any])
    .select()
    .single();

  if (error) {
    console.error('Error adding restaurant table:', error);
    throw new Error(error.message);
  }

  return mapSingleResponse<RestaurantTable>(data, 'Failed to map new table');
};

export const updateRestaurantTable = async (
  id: string, 
  table: Partial<Omit<RestaurantTable, 'id' | 'created_at' | 'updated_at'>>
): Promise<RestaurantTable> => {
  // Add current timestamp for updated_at
  const updates = {
    ...table,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('restaurant_tables')
    .update(updates as any)
    .eq('id', filterValue(id))
    .select()
    .single();

  if (error) {
    console.error('Error updating restaurant table:', error);
    throw new Error(error.message);
  }

  return mapSingleResponse<RestaurantTable>(data, 'Failed to map updated table');
};

export const deleteRestaurantTable = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', filterValue(id));

  if (error) {
    console.error('Error deleting restaurant table:', error);
    throw new Error(error.message);
  }
};

// Table Zones Mutations
export const addTableZone = async (zone: Omit<TableZone, 'id' | 'created_at'>): Promise<TableZone> => {
  const { data, error } = await supabase
    .from('table_zones')
    .insert([zone as any])
    .select()
    .single();

  if (error) {
    console.error('Error adding table zone:', error);
    throw new Error(error.message);
  }

  return mapSingleResponse<TableZone>(data, 'Failed to map new zone');
};

export const updateTableZone = async (
  id: string, 
  zone: Partial<Omit<TableZone, 'id' | 'created_at'>>
): Promise<TableZone> => {
  const { data, error } = await supabase
    .from('table_zones')
    .update(zone as any)
    .eq('id', filterValue(id))
    .select()
    .single();

  if (error) {
    console.error('Error updating table zone:', error);
    throw new Error(error.message);
  }

  return mapSingleResponse<TableZone>(data, 'Failed to map updated zone');
};

export const deleteTableZone = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('table_zones')
    .delete()
    .eq('id', filterValue(id));

  if (error) {
    console.error('Error deleting table zone:', error);
    throw new Error(error.message);
  }
};
