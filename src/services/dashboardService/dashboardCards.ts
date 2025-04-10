
import { DashboardCard, DashboardStats } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, UserRound, Utensils } from 'lucide-react';

export const generateDashboardCards = (stats: DashboardStats): DashboardCard[] => {
  console.log('📊 [DashboardService] Generating dashboard cards from stats:', stats);
  
  // Generate sales card
  const salesCard: DashboardCard = {
    title: 'Ventas del Día',
    value: formatCurrency(stats.salesStats.dailyTotal),
    icon: <DollarSign className="h-4 w-4" />,
    description: `${stats.salesStats.transactionCount} transacciones`,
    trend: {
      value: stats.salesStats.changePercentage,
      label: 'vs. ayer',
      direction: stats.salesStats.changePercentage >= 0 ? 'up' : 'down',
      icon: stats.salesStats.changePercentage >= 0 
        ? <ArrowUpRight className="h-3 w-3" /> 
        : <ArrowDownRight className="h-3 w-3" />
    },
    color: 'blue',
    lastUpdated: stats.salesStats.lastUpdated
  };
  
  // Generate orders card
  const ordersCard: DashboardCard = {
    title: 'Pedidos Activos',
    value: `${stats.ordersStats.activeOrders}`,
    icon: <Activity className="h-4 w-4" />,
    description: `${stats.ordersStats.pendingOrders} pendientes, ${stats.ordersStats.inPreparationOrders} en preparación`,
    color: 'green',
    lastUpdated: stats.ordersStats.lastUpdated
  };
  
  // Generate customers card
  const customersCard: DashboardCard = {
    title: 'Clientes Hoy',
    value: `${stats.customersStats.todayCount}`,
    icon: <UserRound className="h-4 w-4" />,
    color: 'violet',
    lastUpdated: stats.customersStats.lastUpdated,
    trend: {
      value: stats.customersStats.changePercentage,
      label: 'vs. ayer',
      direction: stats.customersStats.changePercentage >= 0 ? 'up' : 'down',
      icon: stats.customersStats.changePercentage >= 0 
        ? <ArrowUpRight className="h-3 w-3" /> 
        : <ArrowDownRight className="h-3 w-3" />
    }
  };
  
  // Generate popular dishes card
  const popularDishesCard: DashboardCard = {
    title: 'Platos Populares',
    icon: <Utensils className="h-4 w-4" />,
    color: 'amber',
    lastUpdated: stats.salesStats.lastUpdated,
    popularItems: stats.popularItems && stats.popularItems.length > 0 
      ? stats.popularItems.map(item => ({
          name: item.name,
          quantity: item.quantity
        }))
      : []
  };
  
  // If no popular items, show "Sin datos" in the value field
  if (!stats.popularItems || stats.popularItems.length === 0) {
    popularDishesCard.value = 'Sin datos';
  } else {
    // Show name of top dish as the value
    popularDishesCard.value = stats.popularItems[0].name;
  }
  
  console.log('📊 [DashboardService] Generated cards:', {
    sales: salesCard.value,
    orders: ordersCard.value,
    customers: customersCard.value,
    popularDishes: popularDishesCard.value
  });
  
  return [salesCard, ordersCard, customersCard, popularDishesCard];
};
