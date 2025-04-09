
import { supabase } from '@/integrations/supabase/client';
import { RestaurantTable, TableZone } from '@/types/tables';
import { getRestaurantTables, getTableZones } from './tableQueries';

// Realtime Subscriptions
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
        // When a change occurs, get all updated tables
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
        // When a change occurs, get all updated zones
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
