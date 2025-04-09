
import { supabase } from '@/integrations/supabase/client';

// Subscribe to dashboard updates using Supabase realtime
export const subscribeToDashboardUpdates = (callback: () => void) => {
  console.log('🔔 [DashboardService] Configurando suscripción en tiempo real mejorada');
  
  // Subscribe to orders table changes
  const channel = supabase
    .channel('dashboard-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' }, 
      () => {
        console.log('🔄 [DashboardService] Cambio detectado en órdenes');
        callback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      () => {
        console.log('🔄 [DashboardService] Cambio detectado en items de órdenes');
        callback();
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    console.log('🔕 [DashboardService] Cancelando suscripción');
    supabase.removeChannel(channel);
  };
};
