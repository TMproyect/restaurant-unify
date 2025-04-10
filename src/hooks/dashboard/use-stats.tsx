
import { useState, useCallback, useRef } from 'react';
import { getDashboardStats, generateDashboardCards } from '@/services/dashboardService';
import { DashboardCard, DashboardStats } from '@/types/dashboard.types';

export function useStats() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false); // Prevent multiple simultaneous requests
  
  const fetchDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) {
      console.log('🔄 [useStats] Already loading stats data, skipping redundant request');
      return;
    }
    
    try {
      console.log('🔄 [useStats] Fetching dashboard stats...');
      setIsLoadingStats(true);
      setError(null);
      loadingRef.current = true;
      
      // Single efficient query for all dashboard stats
      const stats = await getDashboardStats();
      
      console.log('✅ [useStats] Stats fetched successfully:', {
        salesStats: stats.salesStats,
        ordersStats: stats.ordersStats,
        customersStats: stats.customersStats,
        popularItems: stats.popularItems?.length || 0
      });
      
      // Generate cards from stats
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
      loadingRef.current = false;
    }
  }, []);
  
  return {
    dashboardCards,
    isLoadingStats,
    error,
    fetchDashboardData
  };
}
