
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const fetchOrdersToArchive = async (
  supabase: SupabaseClient,
  thresholds: {
    completedThreshold: Date;
    cancelledThreshold: Date;
    testOrdersThreshold: Date;
  }
) => {
  // 1. Find completed orders to archive
  const { data: completedOrders, error: completedError } = await supabase
    .from('orders')
    .select('*')
    .or('status.eq.completed,status.eq.delivered,status.eq.entregado,status.eq.completado')
    .lt('updated_at', thresholds.completedThreshold.toISOString())
    .not('status', 'eq', 'archived');

  if (completedError) {
    console.error(`❌ Error fetching completed orders: ${completedError.message}`);
    throw new Error(`Error fetching completed orders: ${completedError.message}`);
  }
  
  console.log(`🔍 Found ${completedOrders?.length || 0} completed orders to archive`);
  
  // 2. Find cancelled orders to archive
  const { data: cancelledOrders, error: cancelledError } = await supabase
    .from('orders')
    .select('*')
    .or('status.eq.cancelled,status.eq.cancelado,status.eq.cancelada')
    .lt('updated_at', thresholds.cancelledThreshold.toISOString())
    .not('status', 'eq', 'archived');
    
  if (cancelledError) {
    console.error(`❌ Error fetching cancelled orders: ${cancelledError.message}`);
    throw new Error(`Error fetching cancelled orders: ${cancelledError.message}`);
  }
  
  console.log(`🔍 Found ${cancelledOrders?.length || 0} cancelled orders to archive`);
  
  // 3. Find test orders to archive (pending/preparing orders older than configured hours)
  const { data: testOrders, error: testError } = await supabase
    .from('orders')
    .select('*')
    .or('status.eq.pending,status.eq.pendiente,status.eq.preparing,status.eq.preparando,status.eq.en preparación')
    .lt('created_at', thresholds.testOrdersThreshold.toISOString())
    .not('status', 'eq', 'archived');
    
  if (testError) {
    console.error(`❌ Error fetching test orders: ${testError.message}`);
    throw new Error(`Error fetching test orders: ${testError.message}`);
  }
  
  console.log(`🔍 Found ${testOrders?.length || 0} abandoned test orders to archive`);

  // Combine all orders to archive
  return [
    ...(completedOrders || []),
    ...(cancelledOrders || []),
    ...(testOrders || [])
  ];
};
