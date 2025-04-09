
import { useState, useEffect, useCallback } from 'react';
import { 
  getActivityMonitor,
  prioritizeOrder,
  subscribeToDashboardUpdates
} from '@/services/dashboardService';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

// Exported function to handle prioritize action
export async function prioritizeOrderAction(id: string, refreshCallback: () => void) {
  toast.promise(
    prioritizeOrder(id),
    {
      loading: 'Priorizando orden...',
      success: () => {
        // Refresh data after prioritization
        refreshCallback();
        return `¡Orden ${id.substring(0, 6)} priorizada en cocina!`;
      },
      error: `Error al priorizar orden ${id.substring(0, 6)}`
    }
  );
}

export function useActivity() {
  const [activityItems, setActivityItems] = useState<ActivityMonitorItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();

  const fetchActivityData = useCallback(async () => {
    try {
      console.log('🔄 [useActivity] Fetching activity data...');
      setIsLoadingActivity(true);
      
      // Get activity monitor data
      const activity = await getActivityMonitor();
      setActivityItems(activity as ActivityMonitorItem[]);
      
      console.log('✅ [useActivity] Activity data loaded successfully');
    } catch (error) {
      console.error('❌ [useActivity] Error loading activity data:', error);
      setError('No se pudieron cargar los datos de actividad');
      
      uiToast({
        title: "Error",
        description: "No se pudieron cargar los datos de actividad",
        variant: "destructive"
      });
    } finally {
      setIsLoadingActivity(false);
    }
  }, [uiToast]);

  // Set up real-time subscription
  useEffect(() => {
    // Fetch initial data
    fetchActivityData();
    
    // Set up real-time updates
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useActivity] Realtime update triggered, refreshing data...');
      fetchActivityData();
    });
    
    return () => {
      console.log('🔄 [useActivity] Cleaning up activity subscription');
      unsubscribe();
    };
  }, [fetchActivityData]);

  return {
    activityItems,
    isLoadingActivity,
    error,
    fetchActivityData
  };
}
