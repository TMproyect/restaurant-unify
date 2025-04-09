
import { supabase } from '@/integrations/supabase/client';

// This function will be called when the app starts to ensure realtime is enabled
export const setupRealtimeForTables = async () => {
  try {
    console.log('Setting up realtime for database tables...');
    
    // Define the tables we want to enable realtime for
    const tablesWithRealtime = ['orders', 'order_items', 'notifications', 'inventory_items', 'inventory_categories'];
    
    // Log realtime setup
    console.log(`Setting up realtime for tables: ${tablesWithRealtime.join(', ')}`);
    
    // Create channels for each table
    tablesWithRealtime.forEach(table => {
      console.log(`Creating realtime channel for table: ${table}`);
      
      const channel = supabase.channel(`public:${table}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: table 
        }, (payload) => {
          console.log(`✅ Realtime update received for ${table}:`, payload.eventType);
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}: ${status}`);
        });
      
      // We're not storing the channel since this is just a setup function
      // Individual components will create their own subscriptions
    });
    
    console.log('Realtime setup completed successfully');
  } catch (error) {
    console.error('Error setting up realtime:', error);
  }
};

// Call the setup function when this module is loaded
setupRealtimeForTables()
  .then(() => console.log('Initial realtime setup complete'))
  .catch(err => console.error('Error during initial realtime setup:', err));
