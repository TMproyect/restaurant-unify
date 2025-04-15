
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

interface QueryResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

export const getOrdersByDateRange = async (
  startDate: Date,
  endDate: Date,
  status: string[] = ['ready']
): Promise<QueryResult<any>> => {
  console.log(`📊 [DbQueries] Consultando órdenes entre ${startDate.toISOString()} y ${endDate.toISOString()}`);
  
  return await supabase
    .from('orders')
    .select('id, total, status, created_at, customer_name')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString())
    .in('status', status);
};

export const getOrderItems = async (status: string[] = ['ready']): Promise<QueryResult<any>> => {
  return await supabase
    .from('order_items')
    .select(`
      id,
      name,
      menu_item_id,
      quantity,
      order_id,
      orders!inner(status)
    `)
    .in('orders.status', status);
};
