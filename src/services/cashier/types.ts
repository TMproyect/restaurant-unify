
export type CashRegisterShift = {
  id?: string;
  user_id: string;
  started_at: string;
  ended_at?: string | null;
  initial_amount: number;
  final_amount?: number | null;
  status: 'open' | 'closed' | 'closing';
  total_sales?: number;
  total_cash_sales?: number;
  total_card_sales?: number;
  total_cash_in?: number;
  total_cash_out?: number;
  created_at?: string;
};

export type CashMovement = {
  id?: string;
  shift_id: string;
  amount: number;
  type: 'in' | 'out';
  description: string;
  created_at?: string;
  created_by: string;
};
