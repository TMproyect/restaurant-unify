
import { supabase } from '@/integrations/supabase/client';
import { TransactionData } from './types';

// Get recent transactions
export const getRecentTransactions = async (limit: number = 5): Promise<TransactionData[]> => {
  try {
    console.log(`Fetching last ${limit} transactions`);
    
    // Get recent paid orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
    
    return orders.map(order => ({
      id: order.id,
      time: new Date(order.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items_count: order.items_count || 0,
      total: order.total || 0,
      payment_method: 'Efectivo', // This would need to be stored in the database
      server: 'Sistema', // This would need to be stored in the database
      customer_name: order.customer_name
    }));
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return [];
  }
};
