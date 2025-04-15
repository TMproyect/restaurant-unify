
import { DashboardCard, DashboardStats } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

export const generateDashboardCards = (stats: DashboardStats): DashboardCard[] => {
  console.log('📊 [DashboardService] Generando tarjetas desde stats:', stats);
  
  // Generar tarjeta de ventas
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
  
  // Generar tarjeta de órdenes con mensajes claros para cada estado
  const ordersCard: DashboardCard = {
    title: 'Pedidos Activos',
    value: `${stats.ordersStats.activeOrders}`,
    icon: 'activity',
    description: `${stats.ordersStats.pendingOrders} pendientes, ${stats.ordersStats.inPreparationOrders} en preparación, ${stats.ordersStats.readyOrders} listos`,
    color: 'green',
    lastUpdated: stats.ordersStats.lastUpdated
  };
  
  // Generar tarjeta de clientes
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
  
  // Generar tarjeta de platos populares
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
  
  // Si no hay platos populares, mostrar "Sin datos" en el campo de valor
  if (!stats.popularItems || stats.popularItems.length === 0) {
    popularDishesCard.value = 'Sin datos';
  } else {
    // Mostrar nombre del plato más popular como valor
    popularDishesCard.value = stats.popularItems[0].name;
  }
  
  console.log('📊 [DashboardService] Tarjetas generadas:', {
    sales: salesCard.value,
    orders: ordersCard.value,
    customers: customersCard.value,
    popularDishes: popularDishesCard.value
  });
  
  return [salesCard, ordersCard, customersCard, popularDishesCard];
};
