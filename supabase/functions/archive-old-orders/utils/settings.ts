
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export interface ArchiveSettings {
  auto_archive_enabled: boolean;
  completed_hours: number;
  cancelled_hours: number;
  test_orders_hours: number;
  auto_delete_enabled: boolean;
  delete_archived_days: number;
}

export const getArchiveSettings = async (supabase: SupabaseClient): Promise<ArchiveSettings> => {
  const { data: settingsData, error } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', [
      'auto_archive_enabled',
      'completed_hours',
      'cancelled_hours',
      'test_orders_hours',
      'auto_delete_enabled',
      'delete_archived_days'
    ]);
      
  if (error) {
    console.error(`❌ Error fetching archive settings: ${error.message}`);
    throw new Error(`Error fetching archive settings: ${error.message}`);
  }
  
  // Default settings
  const settings: ArchiveSettings = {
    auto_archive_enabled: true,
    completed_hours: 24,
    cancelled_hours: 48,
    test_orders_hours: 12,
    auto_delete_enabled: false,
    delete_archived_days: 30
  };
  
  // Update with settings from database
  if (settingsData) {
    settingsData.forEach(item => {
      if (item.key === 'auto_archive_enabled' || item.key === 'auto_delete_enabled') {
        settings[item.key] = item.value === 'true';
      } else {
        settings[item.key] = parseInt(item.value) || settings[item.key];
      }
    });
  }
  
  console.log(`📊 Archive settings:`, settings);
  return settings;
};

export const calculateThresholds = (settings: ArchiveSettings) => {
  // Get current time
  const now = new Date();
  
  // Calculate timestamps for different archiving thresholds using settings
  const completedThreshold = new Date(now.getTime() - (settings.completed_hours * 60 * 60 * 1000));
  const cancelledThreshold = new Date(now.getTime() - (settings.cancelled_hours * 60 * 60 * 1000));
  const testOrdersThreshold = new Date(now.getTime() - (settings.test_orders_hours * 60 * 60 * 1000));
  
  console.log(`🔄 Archiving completed orders before: ${completedThreshold.toISOString()}`);
  console.log(`🔄 Archiving cancelled orders before: ${cancelledThreshold.toISOString()}`);
  console.log(`🔄 Archiving test orders before: ${testOrdersThreshold.toISOString()}`);

  return {
    completedThreshold,
    cancelledThreshold,
    testOrdersThreshold,
    now
  };
};
