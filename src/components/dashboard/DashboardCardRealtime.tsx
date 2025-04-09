
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getDashboardStats, 
  generateDashboardCards, 
  subscribeToDashboardUpdates 
} from '@/services/dashboardService';
import DashboardCard from './card/DashboardCard';
import LoadingCards from './card/LoadingCards';
import DefaultCards from './card/DefaultCards';

const DashboardCardsRealtime: React.FC = () => {
  const { toast } = useToast();
  console.log('🔄 [DashboardCardsRealtime] Rendering dashboard cards');
  
  const { data: stats, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // 1 minuto
  });

  // Manejar errores
  useEffect(() => {
    if (isError && error) {
      console.error('❌ [DashboardCardsRealtime] Error fetching stats:', error);
      toast({
        title: 'Error al cargar estadísticas',
        description: 'No se pudieron cargar las estadísticas del dashboard. Intentando nuevamente...',
        variant: 'destructive'
      });
    }
  }, [isError, error, toast]);

  // Configurar la suscripción en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('🔄 [DashboardCardsRealtime] Actualizando stats en tiempo real...');
      refetch().catch(err => {
        console.error('❌ [DashboardCardsRealtime] Error refetching stats:', err);
      });
    });
    
    return () => {
      console.log('🔄 [DashboardCardsRealtime] Cleaning up subscriptions');
      unsubscribe();
    };
  }, [refetch]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        <LoadingCards />
      ) : isError || !stats ? (
        <DefaultCards />
      ) : (
        renderCardsFromStats(stats)
      )}
    </div>
  );
};

// Helper function to render cards from stats
const renderCardsFromStats = (stats: any) => {
  try {
    const cards = generateDashboardCards(stats);
    return cards.map((card, i) => <DashboardCard key={i} {...card} />);
  } catch (err) {
    console.error('❌ [DashboardCardsRealtime] Error generating cards:', err);
    return <DefaultCards />;
  }
};

export default DashboardCardsRealtime;
