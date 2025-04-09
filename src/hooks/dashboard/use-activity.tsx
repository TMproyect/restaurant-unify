
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
  const { toast: uiToast } = useToast();

  const fetchActivityData = useCallback(async () => {
    console.log('🔄 [useActivity] Fetching activity data... START');
    
    try {
      setIsLoadingActivity(true);
      setError(null);
      
      console.log('🔄 [useActivity] Requesting activity monitor data...');
      // Get activity monitor data
      const activity = await getActivityMonitor();
      
      console.log(`✅ [useActivity] Activity data loaded: ${activity.length} items`);
      
      setActivityItems(activity);
    } catch (error) {
      console.error('❌ [useActivity] Error loading activity data:', error);
      setError('No se pudieron cargar los datos de actividad');
      
      uiToast({
        title: "Error",
        description: "No se pudieron cargar los datos de actividad",
        variant: "destructive"
      });
    } finally {
      // Always update loading state even if there was an error
      console.log('🔄 [useActivity] Ending fetch operation, setting loading to false');
      setIsLoadingActivity(false);
    }
  }, [uiToast]);

  // Set up data fetching and realtime updates with simplified dependency array
  useEffect(() => {
    console.log('🔄 [useActivity] Setting up initial data fetch and subscriptions');
    
    // Initial data fetch - CRITICAL for first load
    fetchActivityData().catch(err => {
      console.error('❌ [useActivity] Error in initial data fetch:', err);
      setIsLoadingActivity(false); // Ensure we exit loading state even on error
    });
    
    // Set up backup interval with a reasonable frequency
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useActivity] Performing periodic refresh');
      fetchActivityData().catch(err => {
        console.error('❌ [useActivity] Error in interval refresh:', err);
      });
    }, 120000); // Every 2 minutes
    
    // Set up realtime updates with simplified callback
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useActivity] Realtime update triggered');
      fetchActivityData().catch(err => {
        console.error('❌ [useActivity] Error in realtime update:', err);
      });
    });
    
    return () => {
      console.log('🔄 [useActivity] Cleaning up activity subscription');
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []); // Empty dependency array so it only runs once on mount

  return {
    activityItems,
    isLoadingActivity,
    error,
    fetchActivityData
  };
}
