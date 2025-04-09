
import { supabase } from '@/integrations/supabase/client';

// Subscribe to sales updates (when orders are paid)
export const subscribeToSalesUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('sales-channel')
    .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: 'status=eq.paid'
        }, 
        payload => {
          console.log('Sales update received:', payload.eventType);
          callback(payload);
        })
    .subscribe();

  console.log('Subscribed to sales channel');
  return () => {
    console.log('Unsubscribing from sales channel');
    supabase.removeChannel(channel);
  };
};
