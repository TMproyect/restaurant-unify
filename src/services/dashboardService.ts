import { supabase } from '@/integrations/supabase/client';

// Exportamos las funciones del dashboard service

// Funciones adicionales relacionadas con el dashboard pueden ir aquí

// Función de ejemplo para obtener estadísticas del dashboard
export const getDashboardStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas del dashboard');
    
    // Aquí podrías implementar lógica para obtener estadísticas
    // Como el inventario ha sido eliminado, no tenemos estadísticas de stock
    
    return {
      // Estadísticas del dashboard
      ordersToday: 0,
      salesTotal: 0,
      // No más estadísticas de inventario
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas:', error);
    throw error;
  }
};

// Otras funciones relacionadas con el dashboard...

// Función para verificar el estado del sistema
export const checkSystemStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .eq('key', 'system_status');
    
    if (error) throw error;
    
    console.log('🔍 [DashboardService] Estado del sistema verificado:', data);
    
    return {
      status: data && data.length > 0 ? data[0].value : 'online',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al verificar estado del sistema:', error);
    return {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
