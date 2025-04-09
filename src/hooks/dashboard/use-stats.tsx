
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
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    console.log('🔄 [useStats] Fetching dashboard stats... START');
    
    try {
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
    } catch (error) {
      console.error('❌ [useStats] Error loading dashboard stats:', error);
      setError('No se pudieron cargar las estadísticas del dashboard');
      
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas del dashboard",
        variant: "destructive"
      });
    } finally {
      // Always update loading state even if there was an error
      console.log('🔄 [useStats] Ending fetch operation, setting loading to false');
      setIsLoadingStats(false);
    }
  }, [toast]);

  // Set up data fetching and realtime updates with simplified dependency array
  useEffect(() => {
    console.log('🔄 [useStats] Setting up initial data fetch and subscriptions');
    
    // Initial data fetch - CRITICAL for first load
    fetchDashboardData().catch(err => {
      console.error('❌ [useStats] Error in initial data fetch:', err);
      setIsLoadingStats(false); // Ensure we exit loading state even on error
    });
    
    // Set up backup refresh interval with a reasonable frequency
    const refreshInterval = setInterval(() => {
      console.log('🔄 [useStats] Performing periodic refresh');
      fetchDashboardData().catch(err => {
        console.error('❌ [useStats] Error in interval refresh:', err);
      });
    }, 120000); // Every 2 minutes
    
    // Set up realtime updates with simplified callback
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [useStats] Realtime update triggered');
      fetchDashboardData().catch(err => {
        console.error('❌ [useStats] Error in realtime update:', err);
      });
    });
    
    return () => {
      console.log('🔄 [useStats] Cleaning up stats subscription');
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []); // Empty dependency array so it only runs once on mount

  return {
    dashboardCards,
    isLoadingStats,
    error,
    fetchDashboardData
  };
}
