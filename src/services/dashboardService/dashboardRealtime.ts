
import { supabase } from '@/integrations/supabase/client';

// Subscribe to dashboard updates using Supabase realtime
export const subscribeToDashboardUpdates = (callback: () => void) => {
  console.log('🔔 [DashboardService] Configurando suscripción en tiempo real mejorada');
  
  // Subscribe to orders table changes with a more robust channel
  const channel = supabase
    .channel('dashboard-realtime-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' }, 
      (payload) => {
        console.log(`🔄 [DashboardService] Cambio detectado en órdenes: ${payload.eventType} - ID: ${payload.new?.id || payload.old?.id}`);
        console.log(`🔄 [DashboardService] Nuevo estado: ${payload.new?.status}, Anterior: ${payload.old?.status}`);
        callback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      (payload) => {
        console.log(`🔄 [DashboardService] Cambio detectado en items de órdenes: ${payload.eventType}`);
        callback();
      }
    )
    .subscribe((status) => {
      console.log(`🔔 [DashboardService] Estado de la suscripción: ${status}`);
    });
  
  // Return unsubscribe function
  return () => {
    console.log('🔕 [DashboardService] Cancelando suscripción del dashboard');
    supabase.removeChannel(channel);
  };
};
