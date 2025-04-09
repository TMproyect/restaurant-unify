
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isUpdatingRef = useRef(false);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      console.log('🔄 [useStats] Update already in progress, skipping...');
      return;
    }
    
    try {
      console.log('🔄 [useStats] Fetching dashboard stats...');
      isUpdatingRef.current = true;
      setIsLoadingStats(true);
      setError(null);
      
      // Fetch dashboard stats
      const stats: DashboardStats = await getDashboardStats();
      
      // Generate dashboard cards from stats
      const cards = generateDashboardCards(stats);
      
      setDashboardCards(cards);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ [useStats] Error loading dashboard stats:', error);
      setError('No se pudieron cargar las estadísticas del dashboard');
      
      // Only show toast for first error (prevent spam)
      if (!error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas del dashboard",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingStats(false);
      isUpdatingRef.current = false;
    }
  }, [toast]);

  // Set up data fetching and realtime updates
  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    
    // Set up backup interval to ensure data stays current
    // But with a longer interval to avoid excessive updates
    const refreshInterval = setInterval(() => {
      const secondsSinceLastRefresh = (new Date().getTime() - lastRefresh.getTime()) / 1000;
      
      if (secondsSinceLastRefresh > 120) { // Only refresh after 2 minutes of inactivity
        console.log(`🔄 [useStats] Performing periodic refresh after ${secondsSinceLastRefresh.toFixed(0)}s`);
        fetchDashboardData();
      }
    }, 120000); // Check every 2 minutes
    
    // Set up realtime updates
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useStats] Realtime update triggered');
      fetchDashboardData();
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
