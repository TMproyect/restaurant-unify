
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
  value?: string; // Changed to optional to match DashboardCard
  icon: string;
  subvalue?: string;
  change?: DashboardCardChange;
  items?: DashboardCardItem[];
  tooltip?: string;
  lastUpdated?: string;
}

export interface DashboardCardTrend {
  value: number;
  label: string;
  direction: 'up' | 'down';
  icon: string;
}

export interface DashboardCardPopularItem {
  name: string;
  quantity: number;
}

export interface DashboardCard {
  title: string;
  value?: string;
  subtitle?: string;
  description?: string;
  changeValue?: number;
  changeType?: 'positive' | 'negative';
  changeLabel?: string;
  icon: string;
  color: string;
  listItems?: string[];
  tooltip?: string;
  lastUpdated?: string;
  trend?: DashboardCardTrend;
  popularItems?: DashboardCardPopularItem[];
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
  actions: string[]; // Actions are stored as strings with the format "actionType:id"
  kitchenId?: string;  // Add kitchen ID for connecting with kitchen area
  appliedBy?: string;
  orderSource?: string; // Add order source field
}

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onRefresh?: () => void;
  onActionClick?: (action: string) => void;
}
