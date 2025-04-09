
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
  const hasLoadedRef = useRef(false);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    console.log('🔄 [useStats] Fetching dashboard stats...');
    
    // If this is not the initial load, use the updating ref
    if (hasLoadedRef.current && isUpdatingRef.current) {
      console.log('🔄 [useStats] Update already in progress, skipping...');
      return;
    }
    
    try {
      // Set updating flag
      isUpdatingRef.current = true;
      setIsLoadingStats(true);
      setError(null);
      
      console.log('🔄 [useStats] Requesting dashboard stats from service...');
      // Fetch dashboard stats
      const stats: DashboardStats = await getDashboardStats();
      console.log('✅ [useStats] Dashboard stats received:', Object.keys(stats));
      
      // Generate dashboard cards from stats
      const cards = generateDashboardCards(stats);
      console.log('✅ [useStats] Dashboard cards generated:', cards.length);
      
      setDashboardCards(cards);
      setLastRefresh(new Date());
      hasLoadedRef.current = true;
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
      // Always update these states even if there was an error
      setIsLoadingStats(false);
      isUpdatingRef.current = false;
      console.log('🔄 [useStats] Loading state set to false, fetch completed');
    }
  }, [toast]);

  // Set up data fetching and realtime updates
  useEffect(() => {
    console.log('🔄 [useStats] Setting up initial data fetch and subscriptions');
    
    // Initial data fetch - CRITICAL for first load
    fetchDashboardData().catch(err => {
      console.error('❌ [useStats] Error in initial data fetch:', err);
      setIsLoadingStats(false); // Ensure we exit loading state even on error
    });
    
    // Set up backup interval to ensure data stays current
    // But with a longer interval to avoid excessive updates
    const refreshInterval = setInterval(() => {
      const secondsSinceLastRefresh = (new Date().getTime() - lastRefresh.getTime()) / 1000;
      
      if (secondsSinceLastRefresh > 120) { // Only refresh after 2 minutes of inactivity
        console.log(`🔄 [useStats] Performing periodic refresh after ${secondsSinceLastRefresh.toFixed(0)}s`);
        fetchDashboardData().catch(err => {
          console.error('❌ [useStats] Error in interval refresh:', err);
        });
      }
    }, 120000); // Check every 2 minutes
    
    // Set up realtime updates with error handling
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToDashboardUpdates(() => {
        console.log('🔄 [useStats] Realtime update triggered');
        fetchDashboardData().catch(err => {
          console.error('❌ [useStats] Error in realtime update:', err);
        });
      });
    } catch (error) {
      console.error('❌ [useStats] Error setting up realtime subscription:', error);
    }
    
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
