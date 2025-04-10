
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Subscribe to order updates using Supabase realtime
 * This will call the onUpdate callback whenever orders are updated
 */
export const subscribeToDashboardUpdates = (onUpdate: () => void): (() => void) => {
  console.log('🔄 [DashboardService] Setting up realtime subscription to orders...');
  
  try {
    // Subscribe to order changes
    const orderChanges = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('🔄 [DashboardService] Received realtime order update:', payload);
          
          // Show a toast notification for significant events
          if (payload.eventType === 'INSERT') {
            toast.info('Nuevo pedido recibido', {
              description: `Pedido #${payload.new.id.substring(0, 6)} para ${payload.new.customer_name}`
            });
          } else if (payload.eventType === 'UPDATE' && 
                    payload.old.status !== payload.new.status) {
            toast.info('Estado de pedido actualizado', {
              description: `Pedido #${payload.new.id.substring(0, 6)}: ${payload.new.status}`
            });
          }
          
          // Call the update callback to refresh the dashboard data
          onUpdate();
        }
      )
      .subscribe();
    
    // Subscribe to order item changes
    const orderItemsChanges = supabase
      .channel('public:order_items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        (payload) => {
          console.log('🔄 [DashboardService] Received realtime order item update:', payload);
          
          // Call the update callback to refresh the dashboard data
          onUpdate();
        }
      )
      .subscribe();
    
    console.log('✅ [DashboardService] Realtime subscription setup complete');
    
    // Return cleanup function to unsubscribe from both channels
    return () => {
      console.log('🔄 [DashboardService] Cleaning up realtime subscriptions');
      supabase.removeChannel(orderChanges);
      supabase.removeChannel(orderItemsChanges);
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error setting up realtime subscription:', error);
    
    // Return a no-op cleanup function
    return () => {
      console.log('🔄 [DashboardService] No channels to clean up due to setup error');
    };
  }
};
