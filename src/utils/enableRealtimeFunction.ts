
import { supabase } from '@/integrations/supabase/client';

// This function will be called when the app starts to ensure realtime is enabled
export const setupRealtimeForTables = async () => {
  try {
    console.log('Setting up realtime for database tables...');
    
    // Enable realtime for specific tables using direct channel subscription
    // instead of RPC calls which may not be available
    const tablesWithRealtime = ['orders', 'order_items', 'notifications', 'inventory_items', 'inventory_categories'];
    
    // Log realtime setup
    console.log(`Setting up realtime for tables: ${tablesWithRealtime.join(', ')}`);
    
    // We'll use direct channel subscriptions instead of RPC calls
    // The actual subscription is handled in the orderSubscriptions.ts file
    
    console.log('Realtime setup completed. Channels will be created when components mount.');
  } catch (error) {
    console.error('Error setting up realtime:', error);
  }
};
