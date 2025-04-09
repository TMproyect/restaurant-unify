
import { supabase } from '@/integrations/supabase/client';

// Use a debounce mechanism to prevent rapid successive updates
const createDebouncedCallback = (callback, delay = 300) => {
  let timeoutId = null;
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      console.log('🔄 [DashboardService] Executing debounced update callback');
      callback();
      timeoutId = null;
    }, delay);
  };
};

// Define a type for the record structure
interface OrderRecord {
  id?: string;
  status?: string;
  [key: string]: any;
}

// Subscribe to dashboard updates using Supabase realtime
export const subscribeToDashboardUpdates = (callback) => {
  console.log('🔔 [DashboardService] Setting up enhanced realtime subscription');
  
  // Create a debounced version of the callback to prevent rapid updates
  const debouncedCallback = createDebouncedCallback(callback);
  
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
        
        // Use debounced callback to prevent UI flickering on rapid updates
        debouncedCallback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      () => {
        console.log(`🔄 [DashboardService] Order items change detected`);
        debouncedCallback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'kitchen_orders' },
      () => {
        console.log(`🔄 [DashboardService] Kitchen orders change detected`);
        debouncedCallback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'sales' },
      () => {
        console.log(`🔄 [DashboardService] Sales change detected`);
        debouncedCallback();
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    console.log('🔕 [DashboardService] Canceling dashboard subscription');
    supabase.removeChannel(channel);
  };
};
