
/**
 * Tipos unificados para el módulo de cocina
 */
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

// Kitchen Option type
export interface KitchenOption {
  id: string;
  name: string;
}

// Constant kitchen options
export const KITCHEN_OPTIONS: KitchenOption[] = [
  { id: 'all', name: 'Todas las Cocinas' },
  { id: 'main', name: 'Cocina Principal' },
  { id: 'grill', name: 'Parrilla' },
  { id: 'cold', name: 'Cocina Fría' },
  { id: 'pastry', name: 'Pastelería' },
  { id: 'bar', name: 'Bar' }
];

// Kitchen tab status
export type KitchenTabStatus = 'pending' | 'preparing' | 'ready' | 'cancelled';

// Order item interface
export interface OrderItem {
  id: string;
  name: string;
  notes: string;
  quantity: number;
  variants?: any[];
}

// Order display interface
export interface OrderDisplay {
  id: string;
  table: string;
  customerName: string;
  time: string;
  kitchenId: string;
  status: NormalizedOrderStatus;
  items: OrderItem[];
  createdAt: string; // ISO string for timestamp calculations
  orderSource: 'delivery' | 'qr_table' | 'pos' | null;
}

// Kitchen stats interface
export interface KitchenStats {
  pendingItems: number;
  preparingItems: number;
  completedItems: number;
  cancelledItems: number;
  totalItems: number;
  totalOrders: number;
  averageTime: number;
}

// Return type for useKitchenData hook
export interface UseKitchenDataReturn {
  selectedKitchen: string;
  setSelectedKitchen: (kitchenId: string) => void;
  orderStatus: KitchenTabStatus;
  setOrderStatus: (status: KitchenTabStatus) => void;
  orders: OrderDisplay[];
  loading: boolean;
  refreshKey: number;
  handleRefresh: () => void;
  hasViewPermission: boolean;
  hasManagePermission: boolean;
  getKitchenStats: () => KitchenStats;
  getAverageTime: () => string;
  getAverageTimeForStatus: (status: NormalizedOrderStatus) => number;
  getKitchenName: (kitchenId: string) => string;
  updateOrderStatusInKitchen: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<boolean>;
  urgencyThreshold: number;
  setUrgencyThreshold: (minutes: number) => void;
  showOnlyToday: boolean;
  setShowOnlyToday: (value: boolean) => void;
}
