
import { supabase } from '@/integrations/supabase/client';
import { mapArrayResponse, mapSingleResponse, prepareInsertData, filterValue } from '@/utils/supabaseHelpers';

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

// Fetch daily sales summary
export const getDailySalesSummary = async (date?: string): Promise<SalesSummary> => {
  try {
    console.log('Fetching daily sales summary for date:', date || 'today');
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Fetch orders that are paid for the specified date
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .gte('updated_at', `${targetDate}T00:00:00`)
      .lte('updated_at', `${targetDate}T23:59:59`);

    if (todayError) {
      console.error('Error fetching today\'s orders:', todayError);
      return {
        daily_total: 0,
        transactions_count: 0,
        average_sale: 0,
        cancellations: 0
      };
    }

    // Calculate daily metrics
    const dailyTotal = todayOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionsCount = todayOrders?.length || 0;
    const averageSale = transactionsCount > 0 ? dailyTotal / transactionsCount : 0;

    // Get count of cancelled orders
    const { count: cancellations, error: cancelError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('updated_at', `${targetDate}T00:00:00`)
      .lte('updated_at', `${targetDate}T23:59:59`);

    if (cancelError) {
      console.error('Error fetching cancelled orders:', cancelError);
      return {
        daily_total: dailyTotal,
        transactions_count: transactionsCount,
        average_sale: averageSale,
        cancellations: 0
      };
    }

    // Calculate growth rate (comparing with previous day)
    const previousDate = new Date(targetDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const prevDateStr = previousDate.toISOString().split('T')[0];
    
    const { data: prevOrders, error: prevError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .gte('updated_at', `${prevDateStr}T00:00:00`)
      .lte('updated_at', `${prevDateStr}T23:59:59`);
    
    let growthRate = 0;
    
    if (!prevError && prevOrders) {
      const prevTotal = prevOrders.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      if (prevTotal > 0) {
        growthRate = ((dailyTotal - prevTotal) / prevTotal) * 100;
      }
    }

    return {
      daily_total: dailyTotal,
      transactions_count: transactionsCount,
      average_sale: averageSale,
      cancellations: cancellations || 0,
      growth_rate: growthRate
    };
  } catch (error) {
    console.error('Error getting daily sales summary:', error);
    return {
      daily_total: 0,
      transactions_count: 0,
      average_sale: 0,
      cancellations: 0
    };
  }
};

// Fetch sales by period (daily, weekly, monthly)
export const getSalesByPeriod = async (period: 'daily' | 'weekly' | 'monthly', limit: number = 7): Promise<SalesData[]> => {
  try {
    console.log(`Fetching ${period} sales with limit: ${limit}`);
    
    const now = new Date();
    let result: SalesData[] = [];
    
    // Generate dates based on period
    for (let i = 0; i < limit; i++) {
      const date = new Date(now);
      
      if (period === 'daily') {
        date.setDate(date.getDate() - i);
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - (i * 7));
      } else if (period === 'monthly') {
        date.setMonth(date.getMonth() - i);
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const startDate = `${dateStr}T00:00:00`;
      const endDate = `${dateStr}T23:59:59`;
      
      // Fetch orders for this date range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'paid')
        .gte('updated_at', startDate)
        .lte('updated_at', endDate);
      
      if (error) {
        console.error(`Error fetching ${period} sales for ${dateStr}:`, error);
        continue;
      }
      
      const total = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const transactions = orders?.length || 0;
      
      result.push({
        date: dateStr,
        total,
        transactions
      });
    }
    
    return result.reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error(`Error getting ${period} sales:`, error);
    return [];
  }
};

// Get most sold products
export const getMostSoldProducts = async (limit: number = 5, periodDays: number = 7): Promise<ProductSalesData[]> => {
  try {
    console.log(`Fetching top ${limit} products for the last ${periodDays} days`);
    
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateStr = startDate.toISOString();
    
    // First get all order items in the period
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id, 
        order_id, 
        menu_item_id, 
        name, 
        price, 
        quantity,
        orders!inner(status, updated_at)
      `)
      .gte('orders.updated_at', startDateStr)
      .lte('orders.updated_at', endDate)
      .eq('orders.status', 'paid');
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return [];
    }

    // Aggregate by product
    const productMap = new Map<string, { name: string, quantity: number, total: number }>();
    
    orderItems?.forEach(item => {
      const id = item.menu_item_id || item.name; // Fallback to name if no menu_item_id
      const existingProduct = productMap.get(id);
      
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
        existingProduct.total += (item.price * item.quantity);
      } else {
        productMap.set(id, {
          name: item.name,
          quantity: item.quantity,
          total: item.price * item.quantity
        });
      }
    });
    
    // Convert to array and sort by quantity
    const productList = [...productMap.entries()].map(([id, data]) => ({
      product_id: id,
      product_name: data.name,
      quantity: data.quantity,
      total: data.total
    }));
    
    return productList
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting most sold products:', error);
    return [];
  }
};

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

// Subscribe to sales updates (when orders are paid)
export const subscribeToSalesUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('sales-channel')
    .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: 'status=eq.paid'
        }, 
        payload => {
          console.log('Sales update received:', payload.eventType);
          callback(payload);
        })
    .subscribe();

  console.log('Subscribed to sales channel');
  return () => {
    console.log('Unsubscribing from sales channel');
    supabase.removeChannel(channel);
  };
};
