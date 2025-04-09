
// Re-export existing types and add new ones if needed

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
  customer_name: string;
  total: number;
  date: string;
  status: string;
  items_count: number;
}
