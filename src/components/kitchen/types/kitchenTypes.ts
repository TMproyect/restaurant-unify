
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { OrderDisplay, KitchenOption } from '@/components/kitchen/kitchenTypes';

// Type for kitchen tab status (subset of NormalizedOrderStatus)
export type KitchenTabStatus = 'pending' | 'preparing' | 'ready';

// Order source type
export type OrderSource = 'delivery' | 'qr_table' | 'pos' | null;

// Types for kitchen hook state and functions
export interface KitchenState {
  selectedKitchen: string;
  orderStatus: KitchenTabStatus;
  orders: OrderDisplay[];
  loading: boolean;
  refreshKey: number;
  hasViewPermission: boolean;
  hasManagePermission: boolean;
  urgencyThreshold: number; // Minutes before an order is considered urgent
}

export interface KitchenActions {
  setSelectedKitchen: (kitchen: string) => void;
  setOrderStatus: (status: KitchenTabStatus) => void;
  handleRefresh: () => void;
  updateOrderStatusInKitchen: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
  setUrgencyThreshold: (minutes: number) => void;
}

export interface KitchenUtils {
  getKitchenStats: () => {
    pendingItems: number;
    preparingItems: number;
    completedItems: number;
    totalItems: number;
  };
  getAverageTime: () => number;
  getKitchenName: (kitchenId: string) => string;
}

export interface UseKitchenDataReturn extends KitchenState, KitchenActions, KitchenUtils {}

export const KITCHEN_OPTIONS: KitchenOption[] = [
  { id: "all", name: "Todas las Cocinas" },
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
  { id: "bar", name: "Bar" }
];
