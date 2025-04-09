
import { supabase } from '@/integrations/supabase/client';
import { RestaurantTable, TableZone } from '@/types/tables';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

// Restaurant Tables Queries
export const getRestaurantTables = async (): Promise<RestaurantTable[]> => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching restaurant tables:', error);
    throw new Error(error.message);
  }

  return mapArrayResponse<RestaurantTable>(data, 'Failed to map restaurant tables');
};

export const getTableById = async (id: string): Promise<RestaurantTable> => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('id', filterValue(id))
    .single();

  if (error) {
    console.error('Error fetching table by ID:', error);
    throw new Error(error.message);
  }

  return mapSingleResponse<RestaurantTable>(data, 'Failed to map table');
};

// Table Zones Queries
export const getTableZones = async (): Promise<TableZone[]> => {
  const { data, error } = await supabase
    .from('table_zones')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching table zones:', error);
    throw new Error(error.message);
  }

  return mapArrayResponse<TableZone>(data, 'Failed to map table zones');
};

export const getZoneById = async (id: string): Promise<TableZone> => {
  const { data, error } = await supabase
    .from('table_zones')
    .select('*')
    .eq('id', filterValue(id))
    .single();

  if (error) {
    console.error('Error fetching zone by ID:', error);
    throw new Error(error.message);
  }

  return mapSingleResponse<TableZone>(data, 'Failed to map zone');
};
