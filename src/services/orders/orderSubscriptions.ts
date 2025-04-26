import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to order changes in the database with improved error handling and reconnection
 * @param callback Function to call when changes occur
 * @returns Unsubscribe function
 */
export const subscribeToOrders = (callback: (payload: any) => void): (() => void) => {
  console.log('🔄 [orderSubscriptions] Setting up realtime subscription to orders table...');
  
  let channel: RealtimeChannel;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2 seconds
  
  const setupSubscription = () => {
    try {
      // Create channel for realtime updates
      channel = supabase
        .channel('orders-changes')
        .on('postgres_changes', {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders'
        }, (payload: any) => {
          // Type guard to ensure payload has necessary properties
          if (!payload || typeof payload !== 'object') {
            console.error('Invalid payload received:', payload);
            return;
          }

          // Safely access payload properties
          const eventType = payload.eventType as string;
          const newData = payload.new as Record<string, any> | null;
          const oldData = payload.old as Record<string, any> | null;

          console.log('🔄 [orderSubscriptions] Realtime update received:', eventType);
          console.log('🔄 [orderSubscriptions] Order data:', newData || oldData);
          
          // Reset reconnection attempts on successful data
          reconnectAttempts = 0;
          
          // Pass payload to callback
          callback(payload);
        })
        .subscribe((status) => {
          console.log(`🔄 [orderSubscriptions] Supabase realtime subscription status: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ [orderSubscriptions] Successfully subscribed to orders table!');
            reconnectAttempts = 0; // Reset reconnection attempts on successful subscription
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ [orderSubscriptions] Error with realtime subscription');
            
            // Attempt to reconnect if we haven't exceeded max attempts
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              console.log(`🔄 [orderSubscriptions] Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
              
              setTimeout(() => {
                // Clean up the current channel before reconnecting
                supabase.removeChannel(channel);
                setupSubscription();
              }, reconnectDelay * reconnectAttempts); // Exponential backoff
            }
          }
        });
    } catch (error) {
      console.error('❌ [orderSubscriptions] Error setting up realtime subscription:', error);
    }
  };
  
  // Initial setup
  setupSubscription();
      
  // Return unsubscribe function
  return () => {
    console.log('🔄 [orderSubscriptions] Cleaning up subscription');
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Subscribe to order items changes with improved error handling
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
 * Subscribe to orders with a specific filter and improved caching
 * @param filter The status to filter by (optional)
 * @param callback Function to call when changes occur
 * @returns Unsubscribe function
 */
export const subscribeToFilteredOrders = (
  filter: string | null, 
  callback: (payload: any) => void
): (() => void) => {
  console.log(`🔄 [orderSubscriptions] Setting up filtered subscription with filter: ${filter || 'none'}`);
  
  // Keep a simple cache of the last 10 events to prevent duplicate processing
  const eventCache: Set<string> = new Set();
  const MAX_CACHE_SIZE = 10;
  
  try {
    let channel: RealtimeChannel;
    
    const handlePayload = (payload: any) => {
      if (!payload || typeof payload !== 'object') {
        console.error('Invalid payload received:', payload);
        return;
      }

      const newData = payload.new as Record<string, any> | null;
      const oldData = payload.old as Record<string, any> | null;
      const eventId = `${payload.eventType}-${newData?.id || oldData?.id}-${Date.now()}`;
      
      // Check if we've already processed this event
      if (eventCache.has(eventId)) {
        return;
      }
      
      // Add to cache and trim if needed
      eventCache.add(eventId);
      if (eventCache.size > MAX_CACHE_SIZE) {
        const firstItem = eventCache.values().next().value;
        eventCache.delete(firstItem);
      }
      
      console.log(`🔄 [orderSubscriptions] Filtered order update (${filter}):`, payload.eventType);
      callback(payload);
    };

    if (filter) {
      // Subscribe with filter
      channel = supabase
        .channel(`orders-${filter}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `status=eq.${filter}`
        }, handlePayload)
        .subscribe((status) => {
          console.log(`🔄 [orderSubscriptions] Filtered subscription status (${filter}): ${status}`);
        });
    } else {
      // Subscribe to all orders (no filter)
      channel = supabase
        .channel('all-orders')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders'
        }, handlePayload)
        .subscribe((status) => {
          console.log(`🔄 [orderSubscriptions] All orders subscription status: ${status}`);
        });
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
