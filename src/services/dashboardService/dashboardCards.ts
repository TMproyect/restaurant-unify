
import { DashboardCard, DashboardStats } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

export const generateDashboardCards = (stats: DashboardStats): DashboardCard[] => {
  console.log('📊 [DashboardService] Generating dashboard cards from stats:', stats);
  
  // Generate sales card
  const salesCard: DashboardCard = {
    title: 'Ventas del Día',
    value: formatCurrency(stats.salesStats.dailyTotal),
    icon: 'dollar-sign',
    description: `${stats.salesStats.transactionCount} transacciones`,
    trend: {
      value: stats.salesStats.changePercentage,
      label: 'vs. ayer',
      direction: stats.salesStats.changePercentage >= 0 ? 'up' : 'down',
      icon: stats.salesStats.changePercentage >= 0 ? 'arrow-up-right' : 'arrow-down-right'
    },
    color: 'blue',
    lastUpdated: stats.salesStats.lastUpdated
  };
  
  // Generate orders card
  const ordersCard: DashboardCard = {
    title: 'Pedidos Activos',
    value: `${stats.ordersStats.activeOrders}`,
    icon: 'activity',
    description: `${stats.ordersStats.pendingOrders} pendientes, ${stats.ordersStats.inPreparationOrders} en preparación`,
    color: 'green',
    lastUpdated: stats.ordersStats.lastUpdated
  };
  
  // Generate customers card
  const customersCard: DashboardCard = {
    title: 'Clientes Hoy',
    value: `${stats.customersStats.todayCount}`,
    icon: 'user-round',
    color: 'violet',
    lastUpdated: stats.customersStats.lastUpdated,
    trend: {
      value: stats.customersStats.changePercentage,
      label: 'vs. ayer',
      direction: stats.customersStats.changePercentage >= 0 ? 'up' : 'down',
      icon: stats.customersStats.changePercentage >= 0 ? 'arrow-up-right' : 'arrow-down-right'
    }
  };
  
  // Generate popular dishes card
  const popularDishesCard: DashboardCard = {
    title: 'Platos Populares',
    icon: 'utensils',
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
