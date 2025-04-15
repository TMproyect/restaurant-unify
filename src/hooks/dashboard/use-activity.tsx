
import { useState, useCallback, useRef } from 'react';
import { getActivityMonitor, prioritizeOrder } from '@/services/dashboardService';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';

export function useActivity() {
  const [activityItems, setActivityItems] = useState<ActivityMonitorItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false); // Prevent multiple simultaneous requests
  
  const fetchActivityData = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) {
      console.log('🔄 [useActivity] Already loading activity data, skipping redundant request');
      return activityItems;
    }
    
    try {
      console.log('🔄 [useActivity] Fetching activity monitor data...');
      setIsLoadingActivity(true);
      setError(null);
      loadingRef.current = true;
      
      // Fetch data using optimized service method that eliminates N+1 queries
      const items = await getActivityMonitor();
      
      console.log('✅ [useActivity] Activity data fetched:', items.length);
      
      setActivityItems(items);
      return items;
    } catch (err) {
      console.error('❌ [useActivity] Error fetching activity data:', err);
      setError('Error al cargar datos de actividad');
      throw err;
    } finally {
      setIsLoadingActivity(false);
      loadingRef.current = false;
    }
  }, [activityItems]);
  
  return {
    activityItems,
    isLoadingActivity,
    error,
    fetchActivityData
  };
}

export function prioritizeOrderAction(orderId: string, callback?: () => void) {
  console.log('🔄 [useActivity] Prioritizing order:', orderId);
  
  toast.promise(prioritizeOrder(orderId), {
    loading: 'Priorizando orden...',
    success: () => {
      console.log('✅ [useActivity] Order prioritized successfully');
      if (callback) {
        console.log('✅ [useActivity] Running callback after prioritization');
        callback();
      }
      return 'Orden priorizada exitosamente';
    },
    error: (err) => {
      console.error('❌ [useActivity] Error prioritizing order:', err);
      return 'Error al priorizar la orden';
    }
  });
}
