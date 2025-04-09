
/**
 * Tipos específicos para el módulo de cocina
 */

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
  status: string;
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

// Mapeo de estados UI a estados DB
export const UI_TO_DB_STATUS_MAP = {
  pending: ['pending', 'Pendiente', 'pendiente'],
  preparing: ['preparing', 'Preparando', 'preparando', 'En preparación', 'en preparación'],
  ready: ['ready', 'Listo', 'listo', 'delivered', 'Entregada', 'entregada']
};

// Opciones de cocina constantes
export const KITCHEN_OPTIONS: KitchenOption[] = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
  { id: "bar", name: "Bar" }
];
