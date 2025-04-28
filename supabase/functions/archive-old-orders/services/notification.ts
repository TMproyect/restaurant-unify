
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StatusCounts } from './archiver.ts';

export const updateLastRunTime = async (supabase: SupabaseClient): Promise<string> => {
  const lastRunTime = new Date().toISOString();
  await supabase
    .from('system_settings')
    .upsert({ key: 'last_archive_run', value: lastRunTime });
    
  return lastRunTime;
};

export const createNotification = async (
  supabase: SupabaseClient, 
  processedCount: number, 
  isManual: boolean
): Promise<void> => {
  if (processedCount <= 0) return;
  
  try {
    await supabase.from('notifications').insert({
      title: isManual ? 'Archivado manual' : 'Archivado automático',
      description: `Se archivaron ${processedCount} órdenes antiguas`,
      type: 'system',
      user_id: '00000000-0000-0000-0000-000000000000', // System notification
      read: false,
      action_text: 'Ver órdenes archivadas',
      link: '/orders?archived=true'
    });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

export const formatDetails = (statusCounts: StatusCounts) => {
  return {
    ...statusCounts,
    total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  };
};
