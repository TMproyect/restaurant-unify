
import { supabase } from '@/integrations/supabase/client';

// Subscribe to order changes
export const subscribeToOrders = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('orders-channel')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        payload => {
          console.log('Order realtime update received:', payload.eventType);
          callback(payload);
        })
    .subscribe();

  console.log('Subscribed to orders channel');
  return () => {
    console.log('Unsubscribing from orders channel');
    supabase.removeChannel(channel);
  };
};
