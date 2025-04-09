
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast: uiToast } = useToast();

  const fetchActivityData = useCallback(async () => {
    try {
      console.log('🔄 [useActivity] Fetching activity data... Timestamp:', new Date().toISOString());
      setIsLoadingActivity(true);
      setError(null);
      
      // Get activity monitor data
      const activity = await getActivityMonitor();
      
      console.log(`✅ [useActivity] Activity data loaded successfully: ${activity.length} items`);
      if (activity.length > 0) {
        console.log('✅ [useActivity] Sample activity item:', activity[0]);
      }
      
      setActivityItems(activity);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ [useActivity] Error loading activity data:', error);
      setError('No se pudieron cargar los datos de actividad');
      
      // No mostrar toast si ya hay un error previo (evitar spam)
      if (!error) {
        uiToast({
          title: "Error",
          description: "No se pudieron cargar los datos de actividad",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingActivity(false);
    }
  }, [uiToast]);

  // Set up real-time subscription
  useEffect(() => {
    // Fetch initial data
    fetchActivityData();
    
    // Configurar intervalo de respaldo para garantizar actualizaciones periódicas
    // (aunque las actualizaciones en tiempo real deberían ser la fuente principal)
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useActivity] Verificando actualizaciones periódicas');
      
      // Calcular tiempo desde la última actualización
      const now = new Date();
      const secondsSinceLastRefresh = (now.getTime() - lastRefresh.getTime()) / 1000;
      
      // Solo actualizar si han pasado más de 30 segundos desde la última actualización
      if (secondsSinceLastRefresh > 30) {
        console.log(`🔄 [useActivity] Han pasado ${secondsSinceLastRefresh.toFixed(0)} segundos desde la última actualización, refrescando datos...`);
        fetchActivityData();
      } else {
        console.log(`🔄 [useActivity] Actualización reciente (hace ${secondsSinceLastRefresh.toFixed(0)}s), omitiendo actualización periódica`);
      }
    }, 30000); // Verificar cada 30 segundos
    
    // Set up real-time updates con una función de callback mejorada
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useActivity] Realtime update triggered, refreshing data...');
      fetchActivityData().catch(err => {
        console.error('❌ [useActivity] Error during realtime-triggered update:', err);
      });
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
    lastRefresh,
    fetchActivityData
  };
}
