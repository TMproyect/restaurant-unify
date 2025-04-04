
// Definición de tipos para órdenes

export interface Order {
  id: string;
  customer_name: string;
  table_number: number | null;
  table_id: string | null;
  status: string;
  total: number;
  items_count: number;
  is_delivery: boolean;
  kitchen_id: string | null;
  created_at: string;
  updated_at: string;
  external_id?: string | null;
  discount?: number | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  notes?: string | null;
  created_at: string;
}

export interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export interface OrderSummary {
  id: string;
  customer_name: string;
  table_number: number | null;
  status: string;
  total: number;
  items_count: number;
  created_at: string;
}
