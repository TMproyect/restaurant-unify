
// Dashboard types for the dashboard service

export interface DashboardStats {
  salesStats: {
    dailyTotal: number;
    transactionCount: number;
    averageTicket: number;
    changePercentage: number;
    lastUpdated: string;
  };
  ordersStats: {
    activeOrders: number;
    pendingOrders: number;
    inPreparationOrders: number;
    readyOrders: number;
    lastUpdated: string;
  };
  customersStats: {
    todayCount: number;
    changePercentage: number;
    lastUpdated: string;
  };
  popularItems: Array<{
    name: string;
    quantity: number;
    id: string;
  }>;
}

export interface DashboardCardChange {
  value: string;
  isPositive: boolean;
  description: string;
}

export interface DashboardCardItem {
  name: string;
  value: string;
  link?: string;
}

export interface DashboardCardData {
  title: string;
  value: string;
  icon: string;
  subvalue?: string;
  change?: DashboardCardChange;
  items?: DashboardCardItem[];
  tooltip?: string;
  lastUpdated?: string;
}

export interface ActivityMonitorAction {
  label: string;
  action: string;
  type: 'default' | 'warning' | 'danger' | 'success';
}

export interface ActivityMonitorItem {
  id: string;
  type: 'order' | 'reservation';
  status: string;
  customer: string;
  total: number;
  timestamp: string;
  timeElapsed: number;
  isDelayed: boolean;
  hasCancellation: boolean;
  hasDiscount: boolean;
  discountPercentage?: number;
  itemsCount: number;
  actions: string[]; // Changed from ActivityMonitorAction[] to string[] to match implementation
  appliedBy?: string;
}
