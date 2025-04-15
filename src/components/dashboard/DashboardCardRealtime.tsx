
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
import { DashboardCard as DashboardCardType } from '@/types/dashboard.types';

// Adapter function to convert DashboardCardType to DashboardCardProps
const adaptCardToProps = (card: DashboardCardType, index: number) => {
  // Create a prop object that matches DashboardCardProps interface
  return {
    key: index,
    title: card.title,
    value: card.value || 'N/A',
    icon: card.icon,
    // Convert trend data to change format if it exists
    change: card.trend ? {
      isPositive: card.trend.direction === 'up',
      value: `${card.trend.direction === 'up' ? '+' : ''}${card.trend.value.toFixed(1)}%`,
      description: card.trend.label || ''
    } : undefined,
    subvalue: card.description || card.subtitle
  };
};

const DashboardCardRealtime: React.FC = () => {
  const { toast } = useToast();
  console.log('🔄 [DashboardCardRealtime] Rendering dashboard cards');
  
  const { data: stats, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // 1 minuto
  });

  // Manejar errores
  useEffect(() => {
    if (isError && error) {
      console.error('❌ [DashboardCardRealtime] Error fetching stats:', error);
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
      console.log('🔄 [DashboardCardRealtime] Actualizando stats en tiempo real...');
      refetch().catch(err => {
        console.error('❌ [DashboardCardRealtime] Error refetching stats:', err);
      });
    });
    
    return () => {
      console.log('🔄 [DashboardCardRealtime] Cleaning up subscriptions');
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
    return cards.map((card, i) => {
      const cardProps = adaptCardToProps(card, i);
      return <DashboardCard {...cardProps} />;
    });
  } catch (err) {
    console.error('❌ [DashboardCardRealtime] Error generating cards:', err);
    return <DefaultCards />;
  }
};

export default DashboardCardRealtime;
