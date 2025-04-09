
import { supabase } from '@/integrations/supabase/client';
import { TransactionData } from './types';
import { format } from 'date-fns';

export const getRecentTransactions = async (limit: number = 5): Promise<TransactionData[]> => {
  try {
    console.log(`Fetching last ${limit} transactions`);
    
    // Fetch recent completed/paid orders
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['completed', 'paid', 'delivered', 'completado', 'pagado', 'entregado'])
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
    
    // Transform to required format
    return data.map(order => ({
      id: order.id,
      customer_name: order.customer_name || 'Cliente',
      total: order.total || 0,
      date: format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
      status: order.status,
      items_count: order.items_count || 0
    }));
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return [];
  }
};
