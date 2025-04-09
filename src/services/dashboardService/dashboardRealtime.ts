
import { supabase } from '@/integrations/supabase/client';

// Define a type for the record structure
interface OrderRecord {
  id?: string;
  status?: string;
  [key: string]: any;
}

// Subscribe to dashboard updates using Supabase realtime
export const subscribeToDashboardUpdates = (callback) => {
  console.log('🔔 [DashboardService] Setting up realtime subscription');
  
  try {
    // Subscribe to orders table changes with a more robust channel
    const channel = supabase
      .channel('dashboard-realtime-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          // Handle payload safely by casting to our interface
          const newRecord = (payload.new || {}) as OrderRecord;
          const oldRecord = (payload.old || {}) as OrderRecord;
          
          // Extract relevant details for logging
          const recordId = newRecord.id || oldRecord?.id || '';
          const newStatus = newRecord.status || '';
          const oldStatus = oldRecord?.status || '';
          
          console.log(`🔄 [DashboardService] Order change detected: ${payload.eventType} - ID: ${recordId}`);
          if (newStatus !== oldStatus) {
            console.log(`🔄 [DashboardService] Status changed: ${oldStatus} → ${newStatus}`);
          }
          
          // Call callback directly without debouncing for now
          callback();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          console.log(`🔄 [DashboardService] Order items change detected`);
          callback();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kitchen_orders' },
        () => {
          console.log(`🔄 [DashboardService] Kitchen orders change detected`);
          callback();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          console.log(`🔄 [DashboardService] Sales change detected`);
          callback();
        }
      )
      .subscribe((status) => {
        console.log(`🔄 [DashboardService] Subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ [DashboardService] Successfully subscribed to realtime updates!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [DashboardService] Error with subscription channel');
        }
      });
    
    // Return unsubscribe function
    return () => {
      console.log('🔕 [DashboardService] Canceling dashboard subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error setting up realtime subscription:', error);
    // Return a no-op function to prevent errors when unsubscribing
    return () => { console.log('🔕 [DashboardService] No-op unsubscribe (setup failed)'); };
  }
};
