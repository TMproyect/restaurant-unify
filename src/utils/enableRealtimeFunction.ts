
import { supabase } from '@/integrations/supabase/client';

// This function will be called when the app starts to ensure realtime is enabled
export const setupRealtimeForTables = async () => {
  try {
    console.log('Setting up realtime for database tables...');
    
    // Check if the function exists, if not create it
    const { error: checkError } = await supabase.rpc('check_function_exists', {
      function_name: 'enable_realtime_for_table'
    });
    
    if (checkError) {
      console.log('Creating enable_realtime_for_table function...');
      // Create the function if it doesn't exist
      const { error } = await supabase.rpc('create_realtime_function');
      
      if (error) {
        console.error('Error creating realtime function:', error);
        return;
      }
    }
    
    // Enable realtime for specific tables
    const tablesWithRealtime = ['orders', 'order_items', 'notifications'];
    
    for (const table of tablesWithRealtime) {
      const { error } = await supabase.rpc('enable_realtime_for_table', {
        table_name: table
      });
      
      if (error) {
        console.error(`Error enabling realtime for ${table}:`, error);
      } else {
        console.log(`Realtime enabled for ${table}`);
      }
    }
    
    console.log('Realtime setup completed');
  } catch (error) {
    console.error('Error setting up realtime:', error);
  }
};
