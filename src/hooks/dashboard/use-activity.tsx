
import { useState, useEffect, useCallback, useRef } from 'react';
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
  console.log(`🔄 [prioritizeOrderAction] Priorizando orden ${id}`);
  
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const isUpdatingRef = useRef(false);
  const { toast: uiToast } = useToast();

  const fetchActivityData = useCallback(async () => {
    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      console.log('🔄 [useActivity] Update already in progress, skipping...');
      return;
    }
    
    try {
      console.log('🔄 [useActivity] Fetching activity data...');
      isUpdatingRef.current = true;
      setIsLoadingActivity(true);
      setError(null);
      
      // Get activity monitor data
      const activity = await getActivityMonitor();
      
      console.log(`✅ [useActivity] Activity data loaded: ${activity.length} items`);
      
      setActivityItems(activity);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ [useActivity] Error loading activity data:', error);
      setError('No se pudieron cargar los datos de actividad');
      
      // Only show toast for first error (prevent spam)
      if (!error) {
        uiToast({
          title: "Error",
          description: "No se pudieron cargar los datos de actividad",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingActivity(false);
      isUpdatingRef.current = false;
    }
  }, [uiToast]);

  // Set up data fetching and realtime updates
  useEffect(() => {
    // Initial data fetch
    fetchActivityData();
    
    // Set up backup interval with a reasonable frequency
    const refreshInterval = setInterval(() => {
      const secondsSinceLastRefresh = (new Date().getTime() - lastRefresh.getTime()) / 1000;
      
      if (secondsSinceLastRefresh > 120) { // Only refresh after 2 minutes of inactivity
        console.log(`🔄 [useActivity] Performing periodic refresh after ${secondsSinceLastRefresh.toFixed(0)}s`);
        fetchActivityData();
      }
    }, 120000); // Check every 2 minutes
    
    // Set up realtime updates with the same debounced callback mechanism
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useActivity] Realtime update triggered');
      fetchActivityData();
    });
    
    return () => {
      console.log('🔄 [useActivity] Cleaning up activity subscription');
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, [fetchActivityData, lastRefresh]);

  return {
    activityItems,
    isLoadingActivity,
    error,
    fetchActivityData
  };
}
