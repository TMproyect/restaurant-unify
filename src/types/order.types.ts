
export interface Order {
  id?: string;
  table_number: number;
  customer_name: string;
  status: string;
  total: number;
  items_count: number;
  is_delivery: boolean;
  table_id?: string;
  kitchen_id?: string;
  discount?: number;
  created_at?: string;
  updated_at?: string;
  external_id?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'paid' | 'en-route';
