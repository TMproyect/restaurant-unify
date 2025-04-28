
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const setupAutoArchiving = async () => {
  try {
    console.log('🔍 [DashboardService] Checking auto-archive function status...');
    
    // Check if auto-archiving edge function exists and is configured
    const { data: functionData, error: functionError } = await supabase
      .functions.invoke('archive-old-orders', {
        body: { action: 'check-status' }
      });
      
    if (functionError) {
      console.error('❌ [DashboardService] Error checking auto-archive function:', functionError);
      return { success: false, error: functionError.message, settings: null };
    }
    
    console.log('📊 [DashboardService] Auto-archiving status:', functionData);
    return { success: true, settings: functionData?.settings || [] };
  } catch (error) {
    console.error('❌ [DashboardService] Error setting up auto-archiving:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', settings: null };
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
    
    if (!data) {
      console.error('❌ [DashboardService] No response data from archive function');
      return { success: false, error: 'No response data' };
    }
    
    console.log('✅ [DashboardService] Archive process completed:', data);
    
    // Check if there were any errors during archiving
    if (data.errors && data.errors > 0) {
      return { success: true, data, hasErrors: true };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DashboardService] Exception during manual archive:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getArchiveSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', [
        'auto_archive_enabled', 
        'completed_hours',
        'cancelled_hours', 
        'test_orders_hours',
        'last_archive_run'
      ]);
      
    if (error) {
      console.error('❌ [DashboardService] Error fetching archive settings:', error);
      return { success: false, settings: null, error: error.message };
    }
    
    const settings = {
      autoArchiveEnabled: true,
      completedHours: 24,
      cancelledHours: 48,
      testOrdersHours: 12,
      lastArchiveRun: null
    };
    
    // Parse settings from database
    if (data && data.length > 0) {
      data.forEach(setting => {
        if (setting.key === 'auto_archive_enabled') {
          settings.autoArchiveEnabled = setting.value === 'true';
        } else if (setting.key === 'completed_hours') {
          settings.completedHours = parseInt(setting.value) || 24;
        } else if (setting.key === 'cancelled_hours') {
          settings.cancelledHours = parseInt(setting.value) || 48;
        } else if (setting.key === 'test_orders_hours') {
          settings.testOrdersHours = parseInt(setting.value) || 12;
        } else if (setting.key === 'last_archive_run') {
          settings.lastArchiveRun = setting.value;
        }
      });
    }
    
    return { success: true, settings };
  } catch (error) {
    console.error('❌ [DashboardService] Error getting archive settings:', error);
    return { success: false, settings: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const updateArchiveSettings = async (settings: {
  autoArchiveEnabled?: boolean;
  completedHours?: number;
  cancelledHours?: number;
  testOrdersHours?: number;
}) => {
  try {
    const updates = [];
    
    if (settings.autoArchiveEnabled !== undefined) {
      updates.push({
        key: 'auto_archive_enabled',
        value: String(settings.autoArchiveEnabled)
      });
    }
    
    if (settings.completedHours !== undefined) {
      updates.push({
        key: 'completed_hours',
        value: String(settings.completedHours)
      });
    }
    
    if (settings.cancelledHours !== undefined) {
      updates.push({
        key: 'cancelled_hours',
        value: String(settings.cancelledHours)
      });
    }
    
    if (settings.testOrdersHours !== undefined) {
      updates.push({
        key: 'test_orders_hours',
        value: String(settings.testOrdersHours)
      });
    }
    
    if (updates.length === 0) {
      return { success: true };
    }
    
    const { error } = await supabase
      .from('system_settings')
      .upsert(updates);
      
    if (error) {
      console.error('❌ [DashboardService] Error updating archive settings:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ [DashboardService] Error updating archive settings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
