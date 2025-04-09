
import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  generateDashboardCards, 
  subscribeToDashboardUpdates,
  getActivityMonitor,
  prioritizeOrder
} from '@/services/dashboardService';
import { ActivityMonitorItem, DashboardCardData } from '@/types/dashboard.types';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useDashboardData() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCardData[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityMonitorItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

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

  const handleActionClick = useCallback((action: string) => {
    console.log('🔄 [useDashboardData] Action clicked:', action);
    
    const [actionType, id] = action.split(':');
    
    switch (actionType) {
      case 'view':
        // Instead of navigating to a non-existent route, show a toast
        toast.success(`Viendo detalles de orden ${id}`);
        // The orders detail page isn't implemented yet, so we'll show a toast instead
        uiToast({
          title: "Información",
          description: `La vista de detalles para la orden ${id} no está implementada aún.`
        });
        break;
      case 'prioritize':
        toast.promise(
          prioritizeOrder(id),
          {
            loading: 'Priorizando orden...',
            success: () => {
              refreshAllData(); // Refresh data after prioritization
              return `¡Orden ${id} priorizada en cocina!`;
            },
            error: `Error al priorizar orden ${id}`
          }
        );
        break;
      case 'review-cancel':
        // Instead of navigating to a non-existent route, show a toast
        toast.success(`Revisando cancelación de orden ${id}`);
        uiToast({
          title: "Información",
          description: `La vista de revisión de cancelación para la orden ${id} no está implementada aún.`
        });
        break;
      case 'review-discount':
        // Instead of navigating to a non-existent route, show a toast
        toast.success(`Revisando descuento de orden ${id}`);
        uiToast({
          title: "Información",
          description: `La vista de revisión de descuento para la orden ${id} no está implementada aún.`
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
