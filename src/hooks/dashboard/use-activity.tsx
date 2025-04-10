
import { useState, useCallback } from 'react';
import { getActivityMonitor, prioritizeOrder } from '@/services/dashboardService';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';

export function useActivity() {
  const [activityItems, setActivityItems] = useState<ActivityMonitorItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchActivityData = useCallback(async () => {
    try {
      console.log('🔄 [useActivity] Fetching activity monitor data...');
      setIsLoadingActivity(true);
      setError(null);
      
      // Fetch activity data
      const items = await getActivityMonitor();
      
      console.log('✅ [useActivity] Activity data fetched:', items.length);
      console.log('✅ [useActivity] Sample statuses:', items.slice(0, 3).map(i => i.status).join(', '));
      
      // Mark orders with delays or high discounts for proper visual cues
      const processedItems = processActivityItems(items);
      
      setActivityItems(processedItems);
      return processedItems;
    } catch (err) {
      console.error('❌ [useActivity] Error fetching activity data:', err);
      setError('Error al cargar datos de actividad');
      throw err;
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);
  
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
      if (callback) callback();
      return 'Orden priorizada exitosamente';
    },
    error: (err) => {
      console.error('❌ [useActivity] Error prioritizing order:', err);
      return 'Error al priorizar la orden';
    }
  });
}

// Helper function to process activity items for visual indications
function processActivityItems(items: ActivityMonitorItem[]): ActivityMonitorItem[] {
  const delayThresholdMs = 15 * 60 * 1000; // 15 minutes in milliseconds
  const highDiscountThreshold = 15; // 15% discount threshold
  
  console.log('🔄 [useActivity] Processing items for visual cues, using thresholds:',
    {delayThresholdMs, highDiscountThreshold});
  
  return items.map(item => {
    // Check if this is a delayed order
    const isDelayed = item.timeElapsed > delayThresholdMs && 
      !['completed', 'cancelled', 'delivered', 'completado', 'cancelado', 'entregado'].includes(item.status.toLowerCase());
    
    // Check if this is a cancelled order
    const hasCancellation = ['cancelled', 'cancelado', 'cancelada'].includes(item.status.toLowerCase());
    
    // Check if this has high discount
    const hasHighDiscount = item.hasDiscount && item.discountPercentage && item.discountPercentage >= highDiscountThreshold;
    
    if (isDelayed || hasCancellation || hasHighDiscount) {
      console.log(`🔶 [useActivity] Exception detected: ${item.id.substring(0, 6)} - ` +
        `delayed=${isDelayed}, cancelled=${hasCancellation}, highDiscount=${hasHighDiscount}`);
    }
    
    return {
      ...item,
      isDelayed,
      hasCancellation,
      hasDiscount: item.hasDiscount || false
    };
  });
}
