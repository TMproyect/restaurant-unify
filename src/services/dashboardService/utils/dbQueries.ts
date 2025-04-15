
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
      .select('id, total, status, created_at, customer_name, kitchen_id, table_number')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .in('status', status);
      
    if (error) throw createServiceError('Error al consultar órdenes', 'QUERY_ERROR', error);
    
    // Log the raw data for debugging
    console.log(`📊 [DbQueries] Órdenes obtenidas (${data?.length || 0}):`, data);
    if (data && data.length > 0) {
      // Log each order's status for debugging
      data.forEach(order => {
        console.log(`📊 [DbQueries] Orden ${order.id}: estado=${order.status}, kitchen=${order.kitchen_id}, table=${order.table_number}`);
      });
    }
    
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
  console.log(`📊 [DbQueries] Consultando órdenes activas con estados: ${activeStatuses.join(', ')}`);
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
        orders!inner(status, created_at, kitchen_id)
      `)
      .in('orders.status', status);
      
    if (error) throw createServiceError('Error al consultar items', 'QUERY_ERROR', error);
    
    return { data, error: null };
  } catch (error) {
    console.error('❌ [DbQueries] Error:', error);
    return { data: null, error: error as Error };
  }
};
