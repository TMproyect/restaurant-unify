
import { DashboardStats, DashboardCardData } from '@/types/dashboard.types';

// Generate dashboard cards based on stats
export const generateDashboardCards = (stats: DashboardStats): DashboardCardData[] => {
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
      tooltip: 'Pedidos que no han sido entregados o completados',
      lastUpdated: `Actualizado: ${new Date(stats.ordersStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Clientes Hoy',
      value: `${stats.customersStats.todayCount}`,
      icon: 'users',
      tooltip: 'Basado en órdenes completadas hoy',
      change: {
        value: '+12%',  // Placeholder
        isPositive: true,
        description: 'desde la semana pasada'
      },
      lastUpdated: `Actualizado: ${new Date(stats.customersStats.lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Platos Populares',
      value: 'Últimos 7 días',
      icon: 'package',
      items: stats.popularItems.map(item => ({
        name: item.name,
        value: `${item.quantity} vendidos`,
        link: `/menu?item=${item.id}`
      }))
    }
  ];
};
