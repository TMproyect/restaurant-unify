
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

// Kitchen Option type
export type KitchenOption = {
  id: string;
  name: string;
};

// Constant kitchen options
export const KITCHEN_OPTIONS: KitchenOption[] = [
  { id: 'all', name: 'Todas las Cocinas' },
  { id: 'main', name: 'Cocina Principal' },
  { id: 'bar', name: 'Bar' },
  { id: 'grill', name: 'Parrilla' }
];

// Kitchen tab status
export type KitchenTabStatus = 'pending' | 'preparing' | 'ready' | 'cancelled';

// Kitchen stats type
export interface KitchenStats {
  pendingItems: number;
  preparingItems: number;
  completedItems: number;
  cancelledItems: number;
  totalOrders: number;
  averageTime: number;
}

// Return type for useKitchenData hook
export interface UseKitchenDataReturn {
  selectedKitchen: string;
  setSelectedKitchen: (kitchen: string) => void;
  orderStatus: KitchenTabStatus;
  setOrderStatus: (status: KitchenTabStatus) => void;
  orders: any[];
  loading: boolean;
  refreshKey: number;
  handleRefresh: () => void;
  hasViewPermission: boolean;
  hasManagePermission: boolean;
  getKitchenStats: () => KitchenStats;
  getAverageTime: () => string;
  getKitchenName: (kitchenId: string) => string;
  updateOrderStatusInKitchen: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
  urgencyThreshold: number;
  setUrgencyThreshold: (threshold: number) => void;
}
