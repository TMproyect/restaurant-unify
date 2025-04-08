
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, ClipboardList } from 'lucide-react';
import { DashboardCardData, getDashboardStats, subscribeToDashboardUpdates, generateDashboardCards } from '@/services/dashboardService';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Componente para mostrar un icono según el tipo
const CardIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const iconSize = 'h-4 w-4';
  
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

// Función para obtener gradiente según el tipo de tarjeta
const getCardGradient = (icon: string): { bg: string, iconBg: string, textColor: string } => {
  switch (icon) {
    case 'dollar-sign':
      return {
        bg: 'from-blue-50 to-purple-50',
        iconBg: 'from-blue-500 to-purple-500',
        textColor: 'text-purple-800'
      };
    case 'clipboard-list':
      return {
        bg: 'from-green-50 to-teal-50',
        iconBg: 'from-green-500 to-teal-500',
        textColor: 'text-teal-800'
      };
    case 'package':
      return {
        bg: 'from-amber-50 to-orange-50',
        iconBg: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-800'
      };
    case 'users':
      return {
        bg: 'from-indigo-50 to-violet-50',
        iconBg: 'from-indigo-500 to-violet-500',
        textColor: 'text-indigo-800'
      };
    default:
      return {
        bg: 'from-gray-50 to-gray-100',
        iconBg: 'from-gray-500 to-gray-600',
        textColor: 'text-gray-800'
      };
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
  const { bg, iconBg, textColor } = getCardGradient(icon);
  
  return (
    <Card className={`overflow-hidden border-none shadow-md bg-gradient-to-br ${bg} hover:shadow-lg transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${textColor}`}>
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${iconBg} flex items-center justify-center`}>
          <CardIcon icon={icon} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        
        {change && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={`inline-flex items-center ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse border border-gray-100">
            <CardHeader className="flex flex-row justify-between pb-2">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    // Mostrar tarjetas con valores por defecto en caso de error
    console.warn('⚠️ [DashboardCardsRealtime] Showing default cards due to error');
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

  try {
    const cards = generateDashboardCards(stats);
    
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <DashboardCard key={i} {...card} />
        ))}
      </div>
    );
  } catch (err) {
    console.error('❌ [DashboardCardsRealtime] Error generating cards:', err);
    toast({
      title: 'Error al generar tarjetas',
      description: 'Ocurrió un error al procesar los datos de estadísticas',
      variant: 'destructive'
    });
    
    // Mostrar tarjetas con valores por defecto
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
};

export default DashboardCardsRealtime;
