
import { supabase } from '@/integrations/supabase/client';

// Subscribe to order changes
export const subscribeToOrders = (callback: (payload: any) => void) => {
  console.log('Setting up order subscription...');
  
  // Setup channel subscription without the RPC call that's causing errors
  const channel = supabase
    .channel('orders-channel')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        payload => {
          console.log('Order realtime update received:', payload);
          callback(payload);
        })
    .subscribe((status) => {
      console.log(`Orders channel subscription status: ${status}`);
    });

  console.log('Subscribed to orders channel');
  return () => {
    console.log('Unsubscribing from orders channel');
    supabase.removeChannel(channel);
  };
};

// Subscribe to order items changes
export const subscribeToOrderItems = (callback: (payload: any) => void) => {
  console.log('Setting up order items subscription...');
  
  // Setup channel subscription without the RPC call that's causing errors
  const channel = supabase
    .channel('order-items-channel')
    .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        payload => {
          console.log('Order items realtime update received:', payload);
          callback(payload);
        })
    .subscribe((status) => {
      console.log(`Order items channel subscription status: ${status}`);
    });

  console.log('Subscribed to order items channel');
  return () => {
    console.log('Unsubscribing from order items channel');
    supabase.removeChannel(channel);
  };
};
