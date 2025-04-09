
import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  generateDashboardCards, 
  subscribeToDashboardUpdates,
  getActivityMonitor,
  prioritizeOrder,
  checkSystemStatus
} from '@/services/dashboardService';
import { ActivityMonitorItem, DashboardCardData } from '@/types/dashboard.types';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

export function useDashboardData() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCardData[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityMonitorItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🔄 [useDashboardData] Fetching dashboard data...');
      setIsLoadingStats(true);
      
      // Get dashboard stats and generate cards
      const stats = await getDashboardStats();
      const cards = generateDashboardCards(stats);
      setDashboardCards(cards);
      
      console.log('✅ [useDashboardData] Dashboard stats loaded successfully');
    } catch (error) {
      console.error('❌ [useDashboardData] Error loading dashboard stats:', error);
      setError('No se pudieron cargar las estadísticas del dashboard');
      
      uiToast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [uiToast]);

  const fetchActivityData = useCallback(async () => {
    try {
      console.log('🔄 [useDashboardData] Fetching activity data...');
      setIsLoadingActivity(true);
      
      // Get activity monitor data
      const activity = await getActivityMonitor();
      setActivityItems(activity as ActivityMonitorItem[]);
      
      console.log('✅ [useDashboardData] Activity data loaded successfully');
    } catch (error) {
      console.error('❌ [useDashboardData] Error loading activity data:', error);
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

  const refreshAllData = useCallback(() => {
    fetchDashboardData();
    fetchActivityData();
  }, [fetchDashboardData, fetchActivityData]);

  const handleActionClick = useCallback(async (action: string) => {
    console.log('🔄 [useDashboardData] Action clicked:', action);
    
    const [actionType, id] = action.split(':');
    
    switch (actionType) {
      case 'view':
        // Show toast for view action
        toast.success(`Viendo detalles de orden ${id}`);
        uiToast({
          title: "Información",
          description: `Detalles de la orden ${id}`,
        });
        break;
        
      case 'prioritize':
        // Show toast with promise for prioritize action
        toast.promise(
          prioritizeOrder(id),
          {
            loading: 'Priorizando orden...',
            success: () => {
              // Refresh data after prioritization
              refreshAllData();
              return `¡Orden ${id} priorizada en cocina!`;
            },
            error: `Error al priorizar orden ${id}`
          }
        );
        break;
        
      case 'review-cancel':
        // Show toast for review-cancel action
        toast.success(`Revisando cancelación de orden ${id}`);
        uiToast({
          title: "Información",
          description: `Revisando cancelación de la orden ${id}`,
        });
        break;
        
      case 'review-discount':
        // Show toast for review-discount action
        toast.success(`Revisando descuento de orden ${id}`);
        uiToast({
          title: "Información",
          description: `Revisando descuento de la orden ${id}`,
        });
        break;
        
      default:
        console.warn('❌ [useDashboardData] Unknown action type:', actionType);
        toast.error(`Acción desconocida: ${actionType}`);
    }
  }, [refreshAllData, uiToast]);

  // Initial data loading and real-time subscription
  useEffect(() => {
    refreshAllData();
    
    // Set up real-time updates
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useDashboardData] Realtime update triggered, refreshing data...');
      refreshAllData();
    });
    
    return () => {
      console.log('🔄 [useDashboardData] Cleaning up dashboard data hook');
      unsubscribe();
    };
  }, [refreshAllData]);

  // Additional check for system status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkSystemStatus();
      } catch (error) {
        console.error('❌ [useDashboardData] System status check failed:', error);
      }
    };
    
    checkStatus();
  }, []);

  return {
    dashboardCards,
    activityItems,
    isLoadingStats,
    isLoadingActivity,
    error,
    refreshAllData,
    handleActionClick
  };
}
