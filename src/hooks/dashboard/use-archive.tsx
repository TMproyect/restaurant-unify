
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  runManualArchiving, 
  getArchiveSettings, 
  updateArchiveSettings 
} from '@/services/dashboardService/activity/autoArchive';

export const useArchive = (onArchiveComplete?: () => void) => {
  const [archivingInProgress, setArchivingInProgress] = useState(false);
  const [lastArchiveRun, setLastArchiveRun] = useState<string | null>(null);
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);
  const [archiveSettings, setArchiveSettings] = useState({
    completedHours: 24,
    cancelledHours: 48,
    testOrdersHours: 12
  });
  
  // Load archive settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { success, settings } = await getArchiveSettings();
        if (success && settings) {
          setAutoArchiveEnabled(settings.autoArchiveEnabled);
          setLastArchiveRun(settings.lastArchiveRun);
          setArchiveSettings({
            completedHours: settings.completedHours,
            cancelledHours: settings.cancelledHours,
            testOrdersHours: settings.testOrdersHours
          });
        }
      } catch (error) {
        console.error('❌ [use-archive] Error loading archive settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleManualArchive = useCallback(async () => {
    try {
      setArchivingInProgress(true);
      toast.info('Iniciando proceso de archivado...', { duration: 3000 });
      
      const result = await runManualArchiving();
      
      if (!result.success) {
        toast.error(`Error al archivar: ${result.error || 'Error desconocido'}`);
        return;
      }
      
      const data = result.data;
      
      if (data?.processed > 0) {
        const now = new Date().toISOString();
        await supabase
          .from('system_settings')
          .upsert({ key: 'last_archive_run', value: now });
        
        setLastArchiveRun(now);
        
        toast.success(`Se archivaron ${data.processed} órdenes antiguas`, {
          description: data.details 
            ? `Completadas: ${data.details.completed || 0}, Canceladas: ${data.details.cancelled || 0}, Prueba: ${data.details.pending + data.details.preparing || 0}`
            : undefined,
          duration: 5000
        });
        
        // Create a notification in the system
        try {
          await supabase.from('notifications').insert({
            title: 'Archivado manual',
            description: `Se archivaron ${data.processed} órdenes antiguas`,
            type: 'system',
            user_id: '00000000-0000-0000-0000-000000000000', // System notification
            read: false,
            action_text: 'Ver órdenes archivadas',
            link: '/orders?archived=true'
          });
        } catch (notifError) {
          console.error('❌ [use-archive] Error creating notification:', notifError);
        }
        
        if (onArchiveComplete) {
          onArchiveComplete();
        }
      } else {
        toast.info('No hay órdenes para archivar en este momento');
      }
    } catch (error) {
      console.error('❌ [use-archive] Error in manual archive:', error);
      toast.error('Error al archivar órdenes');
    } finally {
      setArchivingInProgress(false);
    }
  }, [onArchiveComplete]);
  
  const updateSettings = async (newSettings: {
    autoArchiveEnabled?: boolean;
    completedHours?: number;
    cancelledHours?: number;
    testOrdersHours?: number;
  }) => {
    try {
      const result = await updateArchiveSettings(newSettings);
      
      if (result.success) {
        // Update local state
        if (newSettings.autoArchiveEnabled !== undefined) {
          setAutoArchiveEnabled(newSettings.autoArchiveEnabled);
        }
        
        setArchiveSettings(prev => ({
          completedHours: newSettings.completedHours ?? prev.completedHours,
          cancelledHours: newSettings.cancelledHours ?? prev.cancelledHours,
          testOrdersHours: newSettings.testOrdersHours ?? prev.testOrdersHours
        }));
        
        toast.success('Configuración de archivado actualizada');
        return true;
      }
      
      toast.error('Error al actualizar la configuración de archivado');
      return false;
    } catch (error) {
      console.error('❌ [use-archive] Error updating settings:', error);
      toast.error('Error al actualizar la configuración de archivado');
      return false;
    }
  };

  return {
    archivingInProgress,
    lastArchiveRun,
    autoArchiveEnabled,
    settings: {
      ...archiveSettings,
      autoArchiveEnabled
    },
    handleManualArchive,
    setLastArchiveRun,
    setAutoArchiveEnabled,
    updateSettings
  };
};
