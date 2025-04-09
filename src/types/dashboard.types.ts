
export interface DashboardCardData {
  title: string;
  value: string;
  icon: string;
  change?: {
    value: string;
    isPositive: boolean;
    description: string;
  };
  details?: string;
  subvalue?: string;
  lastUpdated?: string;
  tooltip?: string;
  items?: {
    name: string;
    value: string;
    link?: string;
  }[];
}

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
  popularItems: {
    name: string;
    quantity: number;
    id: string;
  }[];
}

export interface ActivityMonitorItem {
  id: string;
  type: 'order' | 'sale' | 'exception';
  status: string;
  customer: string;
  total: number;
  timestamp: string;
  timeElapsed?: number; // In minutes
  isDelayed?: boolean;
  hasCancellation?: boolean;
  hasDiscount?: boolean;
  discountAmount?: number;
  discountPercentage?: number;
  appliedBy?: string;
  itemsCount: number;
  actions: {
    label: string;
    action: string;
    type?: 'default' | 'warning' | 'danger';
  }[];
}
