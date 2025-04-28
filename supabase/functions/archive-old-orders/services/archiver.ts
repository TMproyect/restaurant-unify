
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export interface StatusCounts {
  completed: number;
  delivered: number;
  cancelled: number;
  pending: number;
  preparing: number;
}

export interface ArchiveResult {
  processedCount: number;
  errorCount: number;
  statusCounts: StatusCounts;
}

export const archiveOrders = async (supabase: SupabaseClient, ordersToArchive: any[], now: Date): Promise<ArchiveResult> => {
  let processedCount = 0;
  let errorCount = 0;
  
  // Group orders by status for detailed reporting
  const statusCounts: StatusCounts = {
    completed: 0,
    delivered: 0,
    cancelled: 0,
    pending: 0,
    preparing: 0
  };
  
  for (const order of ordersToArchive) {
    try {
      // Track order status for reporting
      if (['completed', 'completado'].includes(order.status)) {
        statusCounts.completed++;
      } else if (['delivered', 'entregado'].includes(order.status)) {
        statusCounts.delivered++;
      } else if (['cancelled', 'cancelado', 'cancelada'].includes(order.status)) {
        statusCounts.cancelled++;
      } else if (['pending', 'pendiente'].includes(order.status)) {
        statusCounts.pending++;
      } else if (['preparing', 'preparando', 'en preparación'].includes(order.status)) {
        statusCounts.preparing++;
      }
      
      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
        
      if (itemsError) {
        console.error(`❌ Error fetching items for order ${order.id}:`, itemsError);
        errorCount++;
        continue;
      }
      
      // Insert to historical_orders
      const { error: histOrderError } = await supabase
        .from('historical_orders')
        .insert({
          id: order.id,
          customer_name: order.customer_name,
          table_number: order.table_number,
          table_id: order.table_id,
          status: order.status,
          total: order.total,
          items_count: order.items_count,
          is_delivery: order.is_delivery,
          kitchen_id: order.kitchen_id,
          created_at: order.created_at,
          updated_at: order.updated_at,
          external_id: order.external_id,
          discount: order.discount,
          order_source: order.order_source
        });
        
      if (histOrderError) {
        console.error(`❌ Error inserting historical order ${order.id}:`, histOrderError);
        errorCount++;
        continue;
      }
      
      // Insert order items to historical_order_items
      if (orderItems && orderItems.length > 0) {
        const historicalItems = orderItems.map(item => ({
          id: item.id,
          order_id: item.order_id,
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes,
          created_at: item.created_at
        }));
        
        const { error: histItemsError } = await supabase
          .from('historical_order_items')
          .insert(historicalItems);
          
        if (histItemsError) {
          console.error(`❌ Error inserting historical items for order ${order.id}:`, histItemsError);
          errorCount++;
          // Continue anyway, the order is more important than its items
        }
      }
      
      // Update the order status to 'archived'
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'archived', updated_at: now.toISOString() })
        .eq('id', order.id);
        
      if (updateError) {
        console.error(`❌ Error archiving order ${order.id}:`, updateError);
        errorCount++;
      } else {
        processedCount++;
        console.log(`✅ Successfully archived order ${order.id}`);
      }
    } catch (error) {
      console.error(`❌ Error processing order ${order.id}:`, error);
      errorCount++;
    }
  }

  return { processedCount, errorCount, statusCounts };
};
