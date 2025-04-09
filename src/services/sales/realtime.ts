
import { supabase } from '@/integrations/supabase/client';

export const subscribeToSalesUpdates = (callback: () => void) => {
  console.log('🔄 Subscribing to sales channel for realtime updates');
  
  // Create a channel for orders table changes
  const channel = supabase
    .channel('sales-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        console.log('🔵 Received realtime update for orders:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log(`Subscribed to sales channel: ${status}`);
    });

  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from sales channel');
    supabase.removeChannel(channel);
  };
};
