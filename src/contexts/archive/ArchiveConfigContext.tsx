
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArchiveSettingsFormData, ArchiveConfigContextProps } from '@/components/dashboard/activity/types';

const defaultSettings: ArchiveSettingsFormData = {
  autoArchiveEnabled: true,
  completedOrdersHours: 24,
  cancelledOrdersHours: 48,
  testOrdersHours: 12,
  deleteArchivedAfterDays: 30
};

const ArchiveConfigContext = createContext<ArchiveConfigContextProps>({
  settings: defaultSettings,
  updateSettings: async () => {}
});

export function ArchiveConfigProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ArchiveSettingsFormData>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('key', [
          'auto_archive_enabled',
          'completed_orders_hours',
          'cancelled_orders_hours',
          'test_orders_hours',
          'delete_archived_after_days'
        ]);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings = data.reduce((acc, item) => {
          switch (item.key) {
            case 'auto_archive_enabled':
              acc.autoArchiveEnabled = item.value === 'true';
              break;
            case 'completed_orders_hours':
              acc.completedOrdersHours = parseInt(item.value);
              break;
            case 'cancelled_orders_hours':
              acc.cancelledOrdersHours = parseInt(item.value);
              break;
            case 'test_orders_hours':
              acc.testOrdersHours = parseInt(item.value);
              break;
            case 'delete_archived_after_days':
              acc.deleteArchivedAfterDays = parseInt(item.value);
              break;
          }
          return acc;
        }, {...defaultSettings});

        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading archive settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<ArchiveSettingsFormData>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Update each setting in the database
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key: key.replace(/([A-Z])/g, '_$1').toLowerCase(),
        value: value.toString()
      }));
      
      const { error } = await supabase
        .from('system_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating archive settings:', error);
      throw error;
    }
  };

  return (
    <ArchiveConfigContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ArchiveConfigContext.Provider>
  );
}

export const useArchiveConfig = () => useContext(ArchiveConfigContext);
