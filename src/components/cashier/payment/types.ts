
import { Order, OrderItem } from "@/services/orderService";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface PaymentState {
  method: string;
  amount: number;
  cashReceived?: number;
}

export interface OrderPaymentDetails {
  order: Order | null;
  items: OrderItem[];
}
