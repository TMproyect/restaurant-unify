
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
  const hasLoadedRef = useRef(false);
  const { toast: uiToast } = useToast();

  const fetchActivityData = useCallback(async () => {
    console.log('🔄 [useActivity] Fetching activity data...');
    
    // If this is not the initial load, use the updating ref
    if (hasLoadedRef.current && isUpdatingRef.current) {
      console.log('🔄 [useActivity] Update already in progress, skipping...');
      return;
    }
    
    try {
      // Set updating flag
      isUpdatingRef.current = true;
      setIsLoadingActivity(true);
      setError(null);
      
      console.log('🔄 [useActivity] Requesting activity monitor data...');
      // Get activity monitor data
      const activity = await getActivityMonitor();
      
      console.log(`✅ [useActivity] Activity data loaded: ${activity.length} items`);
      
      setActivityItems(activity);
      setLastRefresh(new Date());
      hasLoadedRef.current = true;
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
      // Always update these states even if there was an error
      setIsLoadingActivity(false);
      isUpdatingRef.current = false;
      console.log('🔄 [useActivity] Loading state set to false, fetch completed');
    }
  }, [uiToast]);

  // Set up data fetching and realtime updates
  useEffect(() => {
    console.log('🔄 [useActivity] Setting up initial data fetch and subscriptions');
    
    // Initial data fetch - CRITICAL for first load
    fetchActivityData().catch(err => {
      console.error('❌ [useActivity] Error in initial data fetch:', err);
      setIsLoadingActivity(false); // Ensure we exit loading state even on error
    });
    
    // Set up backup interval with a reasonable frequency
    const refreshInterval = setInterval(() => {
      const secondsSinceLastRefresh = (new Date().getTime() - lastRefresh.getTime()) / 1000;
      
      if (secondsSinceLastRefresh > 120) { // Only refresh after 2 minutes of inactivity
        console.log(`🔄 [useActivity] Performing periodic refresh after ${secondsSinceLastRefresh.toFixed(0)}s`);
        fetchActivityData().catch(err => {
          console.error('❌ [useActivity] Error in interval refresh:', err);
        });
      }
    }, 120000); // Check every 2 minutes
    
    // Set up realtime updates with the same debounced callback mechanism
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToDashboardUpdates(() => {
        console.log('🔄 [useActivity] Realtime update triggered');
        fetchActivityData().catch(err => {
          console.error('❌ [useActivity] Error in realtime update:', err);
        });
      });
    } catch (error) {
      console.error('❌ [useActivity] Error setting up realtime subscription:', error);
    }
    
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
