
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
        
        // Use safer property access with type assertions
        const newId = typeof newData === 'object' && newData !== null ? 
          (newData as Record<string, any>)['id'] || '' : '';
        const oldId = typeof oldData === 'object' && oldData !== null ? 
          (oldData as Record<string, any>)['id'] || '' : '';
        const newStatus = typeof newData === 'object' && newData !== null ? 
          (newData as Record<string, any>)['status'] || '' : '';
        const oldStatus = typeof oldData === 'object' && oldData !== null ? 
          (oldData as Record<string, any>)['status'] || '' : '';
        
        console.log(`🔄 [DashboardService] Cambio detectado en órdenes: ${payload.eventType} - ID: ${newId || oldId}`);
        console.log(`🔄 [DashboardService] Nuevo estado: ${newStatus}, Anterior: ${oldStatus}`);
        
        // Ejecuta el callback para actualizar datos
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
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'kitchen_orders' },
      (payload) => {
        console.log(`🔄 [DashboardService] Cambio detectado en cocina: ${payload.eventType}`);
        callback();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'sales' },
      (payload) => {
        console.log(`🔄 [DashboardService] Cambio detectado en ventas: ${payload.eventType}`);
        callback();
      }
    )
    .subscribe((status) => {
      console.log(`🔔 [DashboardService] Estado de la suscripción: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('✅ [DashboardService] Suscripción en tiempo real activada correctamente');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ [DashboardService] Error en la suscripción en tiempo real');
      }
    });
  
  // Return unsubscribe function
  return () => {
    console.log('🔕 [DashboardService] Cancelando suscripción del dashboard');
    supabase.removeChannel(channel);
  };
};
