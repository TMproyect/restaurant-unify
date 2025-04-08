
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, ClipboardList } from 'lucide-react';
import { DashboardCardData, getDashboardStats, subscribeToDashboardUpdates, generateDashboardCards } from '@/services/dashboardService';
import { useQuery } from '@tanstack/react-query';

// Componente para mostrar un icono según el tipo
const CardIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const iconSize = 'h-5 w-5';
  
  switch (icon) {
    case 'dollar-sign':
      return <DollarSign className={iconSize} />;
    case 'users':
      return <Users className={iconSize} />;
    case 'package':
      return <Package className={iconSize} />;
    case 'clipboard-list':
      return <ClipboardList className={iconSize} />;
    default:
      return <DollarSign className={iconSize} />;
  }
};

// Tarjeta individual
export const DashboardCard: React.FC<DashboardCardData> = ({ 
  title, 
  value, 
  icon, 
  change, 
  details 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <CardIcon icon={icon} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className={`inline-flex items-center ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {change.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {change.value}
            </span>
            {' '}{change.description}
          </p>
        )}
        
        {details && (
          <p className="text-xs text-muted-foreground mt-1">
            {details}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Componente que muestra todas las tarjetas de dashboard en tiempo real
export const DashboardCardsRealtime: React.FC = () => {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // 1 minuto
  });

  // Configurar la suscripción en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToDashboardUpdates(() => {
      console.log('Actualizando stats del dashboard...');
      refetch();
    });
    
    return () => {
      unsubscribe();
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-10 bg-muted/20"></CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted/20 rounded"></div>
              <div className="h-4 w-32 bg-muted/20 rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Ventas del Día', value: '$0.00', icon: 'dollar-sign' },
          { title: 'Pedidos Activos', value: '0', icon: 'clipboard-list' },
          { title: 'Inventario Bajo', value: '0', icon: 'package' },
          { title: 'Clientes Hoy', value: '0', icon: 'users' }
        ].map((card, i) => (
          <DashboardCard key={i} {...card} />
        ))}
      </div>
    );
  }

  const cards = generateDashboardCards(stats);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <DashboardCard key={i} {...card} />
      ))}
    </div>
  );
};

export default DashboardCardsRealtime;
