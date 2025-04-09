
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
        // Handle payload safely - these are potentially undefined values
        const newData = payload.new || {};
        const oldData = payload.old || {};
        
        // Safely access properties
        const newId = typeof newData === 'object' ? (newData.id || '') : '';
        const oldId = typeof oldData === 'object' ? (oldData.id || '') : '';
        const newStatus = typeof newData === 'object' ? (newData.status || '') : '';
        const oldStatus = typeof oldData === 'object' ? (oldData.status || '') : '';
        
        console.log(`🔄 [DashboardService] Cambio detectado en órdenes: ${payload.eventType} - ID: ${newId || oldId}`);
        console.log(`🔄 [DashboardService] Nuevo estado: ${newStatus}, Anterior: ${oldStatus}`);
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
