
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to order changes in the database
 * @param callback Function to call when changes occur
 * @returns Unsubscribe function
 */
export const subscribeToOrders = (callback: (payload: any) => void): (() => void) => {
  console.log('🔄 [orderSubscriptions] Setting up realtime subscription to orders table...');
  
  try {
    // Create channel for realtime updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('🔄 [orderSubscriptions] Realtime update received:', payload.eventType);
        console.log('🔄 [orderSubscriptions] Order data:', payload.new || payload.old);
        
        // Pass payload to callback
        callback(payload);
      })
      .subscribe((status) => {
        console.log(`🔄 [orderSubscriptions] Supabase realtime subscription status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ [orderSubscriptions] Successfully subscribed to orders table!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [orderSubscriptions] Error with realtime subscription');
        }
      });
      
    // Return unsubscribe function
    return () => {
      console.log('🔄 [orderSubscriptions] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('❌ [orderSubscriptions] Error setting up realtime subscription:', error);
    return () => {}; // Return empty function in case of error
  }
};

/**
 * Subscribe to order items changes
 * @param callback Function to call when changes occur
 * @returns Unsubscribe function
 */
export const subscribeToOrderItems = (callback: (payload: any) => void): (() => void) => {
  console.log('🔄 [orderSubscriptions] Setting up realtime subscription to order_items table...');
  
  try {
    // Create channel for realtime updates
    const channel = supabase
      .channel('order-items-changes')
      .on('postgres_changes', {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'order_items'
      }, (payload) => {
        console.log('🔄 [orderSubscriptions] Order items update received:', payload.eventType);
        callback(payload);
      })
      .subscribe((status) => {
        console.log(`🔄 [orderSubscriptions] Order items subscription status: ${status}`);
      });
      
    // Return unsubscribe function
    return () => {
      console.log('🔄 [orderSubscriptions] Cleaning up order items subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('❌ [orderSubscriptions] Error setting up order items subscription:', error);
    return () => {}; // Return empty function in case of error
  }
};

/**
 * Subscribe to orders with a specific filter
 * @param filter The status to filter by (optional)
 * @param callback Function to call when changes occur
 * @returns Unsubscribe function
 */
export const subscribeToFilteredOrders = (
  filter: string | null, 
  callback: (payload: any) => void
): (() => void) => {
  console.log(`🔄 [orderSubscriptions] Setting up filtered subscription with filter: ${filter || 'none'}`);
  
  try {
    let channel: RealtimeChannel;
    
    if (filter) {
      // Subscribe with filter
      channel = supabase
        .channel(`orders-${filter}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `status=eq.${filter}`
        }, (payload) => {
          console.log(`🔄 [orderSubscriptions] Filtered order update (${filter}):`, payload.eventType);
          callback(payload);
        })
        .subscribe();
    } else {
      // Subscribe to all orders
      channel = supabase
        .channel('all-orders')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          console.log('🔄 [orderSubscriptions] All orders update:', payload.eventType);
          callback(payload);
        })
        .subscribe();
    }
    
    return () => {
      console.log(`🔄 [orderSubscriptions] Cleaning up filtered subscription (${filter || 'all'})`);
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('❌ [orderSubscriptions] Error setting up filtered subscription:', error);
    return () => {};
  }
};
