
import { supabase } from '@/integrations/supabase/client';

// Subscribe to delivery order changes
export const subscribeToDeliveryUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('delivery-channel')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: 'is_delivery=eq.true'
        }, 
        payload => {
          console.log('Delivery update received:', payload.eventType);
          callback(payload);
        })
    .subscribe();

  console.log('Subscribed to delivery channel');
  return () => {
    console.log('Unsubscribing from delivery channel');
    supabase.removeChannel(channel);
  };
};
