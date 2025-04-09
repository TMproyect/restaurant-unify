
import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  generateDashboardCards, 
  subscribeToDashboardUpdates
} from '@/services/dashboardService';
import { DashboardCardData, DashboardStats } from '@/types/dashboard.types';
import { useToast } from '@/hooks/use-toast';

export function useStats() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCardData[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🔄 [useStats] Fetching dashboard stats... Timestamp:', new Date().toISOString());
      setIsLoadingStats(true);
      setError(null);
      
      // Fetch dashboard stats
      const stats: DashboardStats = await getDashboardStats();
      
      console.log('✅ [useStats] Dashboard stats loaded:', stats);
      
      // Generate dashboard cards from stats
      const cards = generateDashboardCards(stats);
      
      setDashboardCards(cards);
      setLastRefresh(new Date());
      console.log('✅ [useStats] Dashboard stats loaded successfully');
    } catch (error) {
      console.error('❌ [useStats] Error loading dashboard stats:', error);
      setError('No se pudieron cargar las estadísticas del dashboard');
      
      // No mostrar toast si ya hay un error previo (evitar spam)
      if (!error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas del dashboard",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  // Configure real-time updates for stats
  useEffect(() => {
    // Fetch initial data
    fetchDashboardData();
    
    // Configurar intervalo de respaldo para garantizar actualizaciones periódicas
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useStats] Verificando actualizaciones periódicas de estadísticas');
      
      // Calcular tiempo desde la última actualización
      const now = new Date();
      const secondsSinceLastRefresh = (now.getTime() - lastRefresh.getTime()) / 1000;
      
      // Solo actualizar si han pasado más de 60 segundos desde la última actualización
      if (secondsSinceLastRefresh > 60) {
        console.log(`🔄 [useStats] Han pasado ${secondsSinceLastRefresh.toFixed(0)} segundos desde la última actualización de estadísticas, refrescando...`);
        fetchDashboardData();
      } else {
        console.log(`🔄 [useStats] Actualización reciente de estadísticas (hace ${secondsSinceLastRefresh.toFixed(0)}s), omitiendo actualización periódica`);
      }
    }, 60000); // Verificar cada minuto
    
    // Set up real-time updates
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useStats] Realtime update triggered, refreshing dashboard stats...');
      fetchDashboardData().catch(err => {
        console.error('❌ [useStats] Error during realtime-triggered stats update:', err);
      });
    });
    
    return () => {
      console.log('🔄 [useStats] Cleaning up stats subscription');
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, [fetchDashboardData, lastRefresh]);

  return {
    dashboardCards,
    isLoadingStats,
    error,
    fetchDashboardData
  };
}
