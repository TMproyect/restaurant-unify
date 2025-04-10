
import { DashboardCard, DashboardStats } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

// Generate dashboard cards from dashboard statistics
export function generateDashboardCards(stats: DashboardStats): DashboardCard[] {
  console.log('📊 [DashboardService] Generating dashboard cards from stats');
  
  const {
    salesStats,
    ordersStats,
    customersStats,
    popularItems
  } = stats;
  
  const cards: DashboardCard[] = [];
  
  // Sales card
  cards.push({
    title: 'Ventas del Día',
    value: formatCurrency(salesStats.dailyTotal),
    subtitle: `${salesStats.transactionCount} transacciones`,
    changeValue: salesStats.changePercentage,
    changeType: salesStats.changePercentage >= 0 ? 'positive' : 'negative',
    changeLabel: 'vs. ayer',
    icon: 'dollar-sign',
    color: 'blue',
    tooltip: 'Total de ventas registradas hoy en órdenes completadas o entregadas'
  });
  
  // Active Orders card
  cards.push({
    title: 'Pedidos Activos',
    value: ordersStats.activeOrders.toString(),
    subtitle: `${ordersStats.pendingOrders} pendientes, ${ordersStats.inPreparationOrders} en preparación`,
    icon: 'utensils',
    color: 'green',
    tooltip: 'Pedidos que requieren atención inmediata. Incluye órdenes pendientes, en preparación y listas para entregar'
  });
  
  // Customers card
  cards.push({
    title: 'Clientes Hoy',
    value: customersStats.todayCount.toString(),
    changeValue: customersStats.changePercentage,
    changeType: customersStats.changePercentage >= 0 ? 'positive' : 'negative',
    changeLabel: 'vs. ayer',
    icon: 'users',
    color: 'purple',
    tooltip: 'Clientes únicos que han realizado pedidos hoy'
  });
  
  // Popular Items card
  const topItems = popularItems && popularItems.length > 0
    ? popularItems.slice(0, 3).map(item => `${item.name} (${item.quantity})`)
    : ['Sin datos'];
    
  cards.push({
    title: 'Platos Populares',
    value: popularItems && popularItems.length > 0 
      ? popularItems[0]?.name || 'Sin datos'
      : 'Sin datos',
    subtitle: popularItems && popularItems.length > 0 
      ? `Vendido ${popularItems[0]?.quantity || 0} veces`
      : '',
    listItems: topItems,
    icon: 'star',
    color: 'amber',
    tooltip: 'Los platos más vendidos en los últimos 7 días'
  });
  
  console.log('✅ [DashboardService] Generated', cards.length, 'dashboard cards');
  
  return cards;
}
