
import { supabase } from '@/integrations/supabase/client';
import { RestaurantTable, TableZone } from '@/types/tables';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

// Funciones para mesas
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

// Funciones para zonas
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

// Funciones para tiempo real
export const subscribeToTableChanges = (callback: (tables: RestaurantTable[]) => void) => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'restaurant_tables' 
      }, 
      async () => {
        // Cuando ocurre un cambio, obtenemos todas las mesas actualizadas
        try {
          const tables = await getRestaurantTables();
          callback(tables);
        } catch (error) {
          console.error('Error fetching updated tables:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToZoneChanges = (callback: (zones: TableZone[]) => void) => {
  const channel = supabase
    .channel('zone-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'table_zones' 
      }, 
      async () => {
        // Cuando ocurre un cambio, obtenemos todas las zonas actualizadas
        try {
          const zones = await getTableZones();
          callback(zones);
        } catch (error) {
          console.error('Error fetching updated zones:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
