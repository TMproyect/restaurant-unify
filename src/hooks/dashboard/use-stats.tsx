
import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  generateDashboardCards,
  checkSystemStatus
} from '@/services/dashboardService';
import { DashboardCardData } from '@/types/dashboard.types';
import { useToast } from '@/hooks/use-toast';

export function useStats() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCardData[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🔄 [useStats] Fetching dashboard data...');
      setIsLoadingStats(true);
      
      // Get dashboard stats and generate cards
      const stats = await getDashboardStats();
      const cards = generateDashboardCards(stats);
      setDashboardCards(cards);
      
      console.log('✅ [useStats] Dashboard stats loaded successfully');
    } catch (error) {
      console.error('❌ [useStats] Error loading dashboard stats:', error);
      setError('No se pudieron cargar las estadísticas del dashboard');
      
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  // Additional check for system status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkSystemStatus();
      } catch (error) {
        console.error('❌ [useStats] System status check failed:', error);
      }
    };
    
    checkStatus();
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardCards,
    isLoadingStats,
    error,
    fetchDashboardData
  };
}
