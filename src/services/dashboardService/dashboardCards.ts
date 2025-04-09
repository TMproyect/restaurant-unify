
import { DashboardCardData, DashboardStats } from '@/types/dashboard.types';
import {
  CreditCard,
  Utensils,
  Clock,
  TrendingUp,
  ShoppingCart,
  Users,
  BarChart
} from 'lucide-react';

// Generate dashboard cards from statistics data
export const generateDashboardCards = (stats: DashboardStats): DashboardCardData[] => {
  // Format money values with locale
  const formatMoney = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format change percentage
  const formatChangePercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Sales Card
  const salesCard: DashboardCardData = {
    title: 'Ventas del Día',
    value: formatMoney(stats.salesStats.dailyTotal),
    icon: 'CreditCard',
    subvalue: `${stats.salesStats.transactionCount} transacciones • Ticket promedio: ${formatMoney(stats.salesStats.averageTicket)}`,
    change: {
      value: formatChangePercentage(stats.salesStats.changePercentage),
      isPositive: stats.salesStats.changePercentage >= 0,
      description: 'desde ayer'
    },
    tooltip: 'Total de ventas del día en órdenes completadas o entregadas.',
    lastUpdated: stats.salesStats.lastUpdated
  };

  // Orders Card - CORRECTED DEFINITION
  const ordersCard: DashboardCardData = {
    title: 'Pedidos Activos',
    value: String(stats.ordersStats.activeOrders),
    icon: 'Utensils',
    tooltip: 'Órdenes pendientes o en preparación que requieren atención inmediata. No incluye órdenes listas para entregar.',
    items: [
      {
        name: `${stats.ordersStats.pendingOrders} pendientes`,
        value: '',
        link: '/orders?filter=pending'
      },
      {
        name: `${stats.ordersStats.inPreparationOrders} en preparación`,
        value: '',
        link: '/orders?filter=preparing'
      },
      {
        name: `${stats.ordersStats.readyOrders} listos para entregar`,
        value: '',
        link: '/orders?filter=ready'
      }
    ],
    lastUpdated: stats.ordersStats.lastUpdated
  };

  // Customers Card
  const customersCard: DashboardCardData = {
    title: 'Clientes Hoy',
    value: String(stats.customersStats.todayCount),
    icon: 'Users',
    tooltip: 'Número de clientes únicos atendidos hoy (basado en nombre de cliente).',
    change: {
      value: formatChangePercentage(stats.customersStats.changePercentage),
      isPositive: stats.customersStats.changePercentage >= 0,
      description: 'desde ayer'
    },
    lastUpdated: stats.customersStats.lastUpdated
  };

  // Popular Items Card - MANDATORY IMPLEMENTATION
  const popularItemsItems = stats.popularItems.length > 0 
    ? stats.popularItems.map(item => ({
        name: item.name,
        value: `${item.quantity} uds`,
        link: `/menu/item/${item.id}`
      }))
    : [{ name: 'No hay datos suficientes', value: '', link: '' }];
  
  const popularItemsCard: DashboardCardData = {
    title: 'Platos Populares',
    value: 'Últimos 7 días',
    icon: 'BarChart',
    tooltip: 'Los platos más vendidos durante los últimos 7 días, basado en órdenes completadas.',
    items: popularItemsItems,
    lastUpdated: stats.salesStats.lastUpdated
  };

  return [
    salesCard,
    ordersCard,
    customersCard,
    popularItemsCard
  ];
};

// Map icon strings to Lucide React components
export const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType> = {
    CreditCard,
    Utensils,
    Clock,
    TrendingUp,
    ShoppingCart,
    Users,
    BarChart
  };
  
  return icons[iconName] || CreditCard;
};
