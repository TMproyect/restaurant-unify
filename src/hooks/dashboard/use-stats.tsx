
import { useState, useCallback } from 'react';
import { getDashboardStats, generateDashboardCards } from '@/services/dashboardService';
import { DashboardCard, DashboardStats } from '@/types/dashboard.types';

export function useStats() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🔄 [useStats] Fetching dashboard stats...');
      setIsLoadingStats(true);
      setError(null);
      
      // Fetch dashboard statistics
      const stats = await getDashboardStats();
      
      console.log('✅ [useStats] Stats fetched successfully:', {
        salesStats: stats.salesStats,
        ordersStats: stats.ordersStats,
        customersStats: stats.customersStats,
        popularItems: stats.popularItems?.length || 0
      });
      
      // Generate dashboard cards from stats
      const cards = generateDashboardCards(stats);
      
      console.log('✅ [useStats] Dashboard cards generated:', cards.length);
      
      setDashboardCards(cards);
      return stats;
    } catch (err) {
      console.error('❌ [useStats] Error fetching dashboard stats:', err);
      setError('Error al cargar los datos del dashboard');
      throw err;
    } finally {
      setIsLoadingStats(false);
    }
  }, []);
  
  return {
    dashboardCards,
    isLoadingStats,
    error,
    fetchDashboardData
  };
}
