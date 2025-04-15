
import { supabase } from '@/integrations/supabase/client';
import { createServiceError } from '@/utils/errorHandling';
import { getTodayRange } from './dateRangeUtils';
import { DASHBOARD_ORDER_STATUSES } from '../constants/orderStatuses';

interface QueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

export const getOrdersByDateRange = async (
  startDate: Date,
  endDate: Date,
  status: string[] = ['ready']
): Promise<QueryResult<any>> => {
  try {
    console.log(`📊 [DbQueries] Consultando órdenes entre ${startDate.toISOString()} y ${endDate.toISOString()}`);
    console.log(`📊 [DbQueries] Filtrando por estados: ${status.join(', ')}`);
    
    const { data, error } = await supabase
      .from('orders')
      .select('id, total, status, created_at, customer_name')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .in('status', status);
      
    if (error) throw createServiceError('Error al consultar órdenes', 'QUERY_ERROR', error);
    
    return { data, error: null };
  } catch (error) {
    console.error('❌ [DbQueries] Error:', error);
    return { data: null, error: error as Error };
  }
};

export const getActiveOrders = async (): Promise<QueryResult<any>> => {
  const { start, end } = getTodayRange();
  // Create a new array from the readonly array
  const activeStatuses = [...DASHBOARD_ORDER_STATUSES.ACTIVE];
  return getOrdersByDateRange(start, end, activeStatuses);
};

export const getOrderItems = async (status: string[] = ['ready']): Promise<QueryResult<any>> => {
  try {
    console.log(`📊 [DbQueries] Consultando items de órdenes con estados: ${status.join(', ')}`);
    
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        name,
        menu_item_id,
        quantity,
        order_id,
        orders!inner(status, created_at)
      `)
      .in('orders.status', status);
      
    if (error) throw createServiceError('Error al consultar items', 'QUERY_ERROR', error);
    
    return { data, error: null };
  } catch (error) {
    console.error('❌ [DbQueries] Error:', error);
    return { data: null, error: error as Error };
  }
};
