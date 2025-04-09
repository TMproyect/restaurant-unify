
import { DashboardStats, DashboardCardData } from '@/types/dashboard.types';

// Generate dashboard cards based on stats
export const generateDashboardCards = (stats: DashboardStats): DashboardCardData[] => {
  // Map popular items to the correct format for display
  const popularItemsForDisplay = stats.popularItems.map(item => ({
    name: item.name,
    value: `${item.quantity} vendidos`,
    link: item.id ? `/menu?item=${item.id}` : undefined
  }));

  return [
    {
      title: 'Ventas del Día',
      value: `$${stats.salesStats.dailyTotal.toFixed(2)}`,
      icon: 'dollar-sign',
      subvalue: `${stats.salesStats.transactionCount} transacciones • Ticket promedio: $${stats.salesStats.averageTicket.toFixed(2)}`,
      change: {
        value: `${stats.salesStats.changePercentage > 0 ? '+' : ''}${stats.salesStats.changePercentage.toFixed(1)}%`,
        isPositive: stats.salesStats.changePercentage >= 0,
        description: 'desde ayer'
      },
      tooltip: 'Total de ventas completadas hoy',
      lastUpdated: `Actualizado: ${new Date(stats.salesStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Pedidos Activos',
      value: `${stats.ordersStats.activeOrders}`,
      icon: 'clipboard-list',
      subvalue: `${stats.ordersStats.pendingOrders} pendientes • ${stats.ordersStats.inPreparationOrders} en preparación • ${stats.ordersStats.readyOrders} listos`,
      tooltip: 'Pedidos que no han sido entregados o completados. Los estados "priority-pending" y "priority-preparing" indican órdenes que han sido marcadas como prioritarias y requieren atención inmediata.',
      lastUpdated: `Actualizado: ${new Date(stats.ordersStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Clientes Hoy',
      value: `${stats.customersStats.todayCount}`,
      icon: 'users',
      tooltip: 'Número de clientes únicos basado en órdenes completadas hoy',
      change: {
        value: '+12%',  // Placeholder - in a real app, calculate from actual data
        isPositive: true,
        description: 'desde la semana pasada'
      },
      lastUpdated: `Actualizado: ${new Date(stats.customersStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Platos Populares',
      value: 'Últimos 7 días',
      icon: 'package',
      tooltip: 'Los platos más vendidos en los últimos 7 días basado en órdenes completadas',
      items: popularItemsForDisplay,
      lastUpdated: `Actualizado: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    }
  ];
};
