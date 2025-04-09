
// Define shared types for the reports module

export interface CategorySalesData {
  name: string;
  value: number;
  percentage?: number;
}

export interface HourlySalesData {
  hour: string;
  sales: number;
}

export interface MonthlySalesData {
  month: string;
  sales: number;
}

export interface SavedReport {
  id: number;
  name: string;
  date: string;
  type: 'PDF' | 'Excel';
  url?: string;
}
