
import { supabase } from '@/integrations/supabase/client';

export const setupAutoArchiving = async () => {
  try {
    // Check if auto-archiving edge function exists and is configured
    const { data: functionData, error: functionError } = await supabase
      .functions.invoke('archive-old-orders', {
        body: { action: 'check-status' }
      });
      
    if (functionError) {
      console.error('❌ [DashboardService] Error checking auto-archive function:', functionError);
      return false;
    }
    
    console.log('📊 [DashboardService] Auto-archiving status:', functionData);
    return true;
  } catch (error) {
    console.error('❌ [DashboardService] Error setting up auto-archiving:', error);
    return false;
  }
};

export const runManualArchiving = async () => {
  try {
    console.log('🔄 [DashboardService] Starting manual archive process...');
    
    const { data, error } = await supabase.functions.invoke('archive-old-orders', {
      body: { action: 'run-now' }
    });
    
    if (error) {
      console.error('❌ [DashboardService] Error triggering manual archive:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ [DashboardService] Archive process completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DashboardService] Exception during manual archive:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
