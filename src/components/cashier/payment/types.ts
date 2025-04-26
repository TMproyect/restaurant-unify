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
  tipAmount?: number;
  tipPercentage?: number;
  timestamp?: string;
}

export interface OrderPaymentDetails {
  order: Order | null;
  items: OrderItem[];
}

export interface PaymentData {
  orderId: string;
  payments: PaymentState[];
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  paymentDate: string;
}

export interface PaymentSummaryProps {
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  tipAmount: number;
  tipPercentage: number;
  total: number;
  pendingAmount: number;
}

export interface DailySummaryData {
  date: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  orderCount: number;
  averageTicket: number;
}
