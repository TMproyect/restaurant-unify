
import { ReactNode } from 'react';

// Dashboard stats and metric types
export interface DashboardStats {
  salesStats: SalesStats;
  ordersStats: OrdersStats;
  customersStats: CustomersStats;
  popularItems: PopularMenuItem[];
}

export interface SalesStats {
  dailyTotal: number;
  transactionCount: number;
  averageTicket: number;
  changePercentage: number;
  lastUpdated: string;
}

export interface OrdersStats {
  activeOrders: number;
  pendingOrders: number;
  inPreparationOrders: number;
  readyOrders: number;
  completedOrders?: number;
  cancelledOrders?: number;
  lastUpdated: string;
}

export interface CustomersStats {
  todayCount: number;
  changePercentage: number;
  lastUpdated: string;
}

export interface PopularMenuItem {
  id: string;
  name: string;
  quantity: number;
}

// Dashboard cards and UI types
export interface DashboardCardData {
  title: string;
  value: string;
  changePercent?: number;
  changeText?: string;
  icon?: ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
  linkText?: string;
  linkHref?: string;
  detail?: string;
  footer?: ReactNode | string;
}

// Activity monitor types
export interface ActivityMonitorItem {
  id: string;
  type: 'order' | 'customer' | 'staff' | 'system';
  customer: string;
  status: string;
  timestamp: string;
  total: number;
  itemsCount: number;
  timeElapsed: number;
  isDelayed: boolean;
  hasCancellation: boolean;
  hasDiscount: boolean;
  discountPercentage?: number;
  actions: string[];
  kitchenId: string;
  orderSource: string;
  isPrioritized?: boolean;
}

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onActionClick: (action: string) => void;
}
