
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const subscribeToOrders = (callback: (payload: RealtimePostgresChangesPayload<any>) => void) => {
  console.log('🔄 [subscribeToOrders] Setting up realtime subscription to orders table');
  
  try {
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('✅ [subscribeToOrders] Received realtime update:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log(`🔄 [subscribeToOrders] Subscription status:`, status);
      });

    console.log('✅ [subscribeToOrders] Subscription set up successfully');
    
    // Return an unsubscribe function
    return () => {
      console.log('🔄 [subscribeToOrders] Unsubscribing from orders channel');
      supabase.removeChannel(subscription);
    };
  } catch (error) {
    console.error('❌ [subscribeToOrders] Error setting up subscription:', error);
    // Return a no-op function if subscription fails
    return () => {
      console.log('🔄 [subscribeToOrders] No-op unsubscribe called (subscription had failed)');
    };
  }
};
