
// Types for sales related data

export interface SalesSummary {
  daily_total: number;
  transactions_count: number;
  average_sale: number;
  cancellations: number;
  growth_rate?: number;
}

export interface SalesData {
  date: string;
  total: number;
  transactions: number;
}

export interface ProductSalesData {
  product_id: string;
  product_name: string;
  quantity: number;
  total: number;
}

export interface TransactionData {
  id: string;
  time: string;
  items_count: number;
  total: number;
  payment_method: string;
  server: string;
  customer_name: string;
}
