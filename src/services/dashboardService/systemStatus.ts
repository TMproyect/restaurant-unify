
import { supabase } from '@/integrations/supabase/client';

// Function to check system status
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
