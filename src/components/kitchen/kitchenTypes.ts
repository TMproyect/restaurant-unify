
/**
 * Tipos específicos para el módulo de cocina
 */
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

export interface OrderItem {
  id: string;
  name: string;
  notes: string;
  quantity: number;
}

export interface OrderDisplay {
  id: string;
  table: string;
  customerName: string;
  time: string;
  kitchenId: string;
  status: NormalizedOrderStatus;
  items: OrderItem[];
}

export interface KitchenOption {
  id: string;
  name: string;
}

export interface KitchenStats {
  pendingItems: number;
  preparingItems: number;
  completedItems: number;
  totalItems: number;
}

// Opciones de cocina constantes
export const KITCHEN_OPTIONS: KitchenOption[] = [
  { id: "all", name: "Todas las Cocinas" },
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
  { id: "bar", name: "Bar" }
];
