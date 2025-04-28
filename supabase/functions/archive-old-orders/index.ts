
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Initialize Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting order archiving process...');
    
    // Get current time
    const now = new Date();
    
    // Calculate timestamps for different archiving thresholds
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
    const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));
    
    console.log(`🔄 Archiving completed orders before: ${twentyFourHoursAgo.toISOString()}`);
    console.log(`🔄 Archiving cancelled orders before: ${fortyEightHoursAgo.toISOString()}`);
    console.log(`🔄 Archiving test orders before: ${twelveHoursAgo.toISOString()}`);

    // 1. Find orders to archive based on rules
    // Archive completed orders older than 24 hours
    const { data: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.completed,status.eq.delivered,status.eq.entregado,status.eq.completado')
      .lt('updated_at', twentyFourHoursAgo.toISOString());

    if (completedError) {
      throw new Error(`Error fetching completed orders: ${completedError.message}`);
    }
    
    // Archive cancelled orders older than 48 hours
    const { data: cancelledOrders, error: cancelledError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.cancelled,status.eq.cancelado,status.eq.cancelada')
      .lt('updated_at', fortyEightHoursAgo.toISOString());
      
    if (cancelledError) {
      throw new Error(`Error fetching cancelled orders: ${cancelledError.message}`);
    }
    
    // Archive test orders (pending/preparing orders older than 12 hours, likely test data)
    const { data: testOrders, error: testError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.pending,status.eq.pendiente,status.eq.preparing,status.eq.preparando,status.eq.en preparación')
      .lt('created_at', twelveHoursAgo.toISOString());
      
    if (testError) {
      throw new Error(`Error fetching test orders: ${testError.message}`);
    }

    // Combine all orders to archive
    const ordersToArchive = [
      ...(completedOrders || []),
      ...(cancelledOrders || []),
      ...(testOrders || [])
    ];
    
    console.log(`🔄 Found ${ordersToArchive.length} orders to archive`);

    if (ordersToArchive.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No orders to archive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Move orders to historical_orders table and get their IDs
    const orderIds = ordersToArchive.map(order => order.id);
    const batchSize = 50; // Process in batches to avoid timeouts
    
    let processedCount = 0;
    let errorCount = 0;
    
    // Process orders in batches
    for (let i = 0; i < orderIds.length; i += batchSize) {
      const batchIds = orderIds.slice(i, i + batchSize);
      
      // Insert orders into historical_orders 
      const { error: insertError } = await supabase.rpc('archive_orders', {
        order_ids: batchIds
      });
      
      if (insertError) {
        console.error(`❌ Error archiving orders batch ${i}:`, insertError);
        errorCount += batchIds.length;
      } else {
        console.log(`✅ Successfully archived batch ${i} with ${batchIds.length} orders`);
        processedCount += batchIds.length;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Archive process completed', 
        processed: processedCount,
        errors: errorCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in archive process:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
