
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useArchive = (onArchiveComplete?: () => void) => {
  const [archivingInProgress, setArchivingInProgress] = useState(false);
  const [lastArchiveRun, setLastArchiveRun] = useState<string | null>(null);
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);

  const handleManualArchive = async () => {
    try {
      setArchivingInProgress(true);
      toast.info('Iniciando proceso de archivado...');
      
      const { data, error } = await supabase.functions.invoke('archive-old-orders');
      
      if (error) {
        console.error('❌ [ActivityMonitor] Error archiving orders:', error);
        toast.error(`Error al archivar: ${error.message}`);
        return;
      }
      
      if (data.processed > 0) {
        const now = new Date().toISOString();
        await supabase
          .from('system_settings')
          .upsert({ key: 'last_archive_run', value: now });
        
        setLastArchiveRun(now);
        toast.success(`Se archivaron ${data.processed} órdenes antiguas correctamente`);
        
        if (onArchiveComplete) {
          onArchiveComplete();
        }
      } else {
        toast.info('No hay órdenes para archivar en este momento');
      }
    } catch (error) {
      console.error('❌ [ActivityMonitor] Error in manual archive:', error);
      toast.error('Error al archivar órdenes');
    } finally {
      setArchivingInProgress(false);
    }
  };

  return {
    archivingInProgress,
    lastArchiveRun,
    autoArchiveEnabled,
    handleManualArchive,
    setLastArchiveRun,
    setAutoArchiveEnabled
  };
};
