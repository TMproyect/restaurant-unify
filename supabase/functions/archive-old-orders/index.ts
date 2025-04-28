
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
    
    // Parse request body
    let action = 'run-now';
    try {
      const body = await req.json();
      action = body.action || 'run-now';
    } catch (e) {
      // If no valid JSON body or no action specified, default to run-now
    }
    
    // If this is just a status check
    if (action === 'check-status') {
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'auto_archive_enabled', 
          'completed_hours',
          'cancelled_hours', 
          'test_orders_hours',
          'last_archive_run'
        ]);
      
      if (settingsError) {
        throw new Error(`Error fetching archive settings: ${settingsError.message}`);
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'active',
          settings: settingsData,
          message: 'Archive function is active'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch user archiving settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', [
        'auto_archive_enabled',
        'completed_hours',
        'cancelled_hours',
        'test_orders_hours',
        'auto_delete_enabled',
        'delete_archived_days'
      ]);
      
    if (settingsError) {
      throw new Error(`Error fetching archive settings: ${settingsError.message}`);
    }
    
    // Default settings
    const settings = {
      auto_archive_enabled: true,
      completed_hours: 24,
      cancelled_hours: 48,
      test_orders_hours: 12,
      auto_delete_enabled: false,
      delete_archived_days: 30
    };
    
    // Update with settings from database
    if (settingsData) {
      settingsData.forEach(item => {
        if (item.key === 'auto_archive_enabled' || item.key === 'auto_delete_enabled') {
          settings[item.key] = item.value === 'true';
        } else {
          settings[item.key] = parseInt(item.value) || settings[item.key];
        }
      });
    }
    
    // If auto archive is disabled and this isn't a manual invocation, exit
    const isManualInvocation = action === 'run-now' || req.method === 'POST';
    if (!settings.auto_archive_enabled && !isManualInvocation) {
      return new Response(
        JSON.stringify({ message: 'Auto-archiving is disabled', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get current time
    const now = new Date();
    
    // Calculate timestamps for different archiving thresholds using settings
    const completedThreshold = new Date(now.getTime() - (settings.completed_hours * 60 * 60 * 1000));
    const cancelledThreshold = new Date(now.getTime() - (settings.cancelled_hours * 60 * 60 * 1000));
    const testOrdersThreshold = new Date(now.getTime() - (settings.test_orders_hours * 60 * 60 * 1000));
    
    console.log(`🔄 Archiving completed orders before: ${completedThreshold.toISOString()}`);
    console.log(`🔄 Archiving cancelled orders before: ${cancelledThreshold.toISOString()}`);
    console.log(`🔄 Archiving test orders before: ${testOrdersThreshold.toISOString()}`);

    // 1. Find orders to archive based on configured rules
    // Archive completed orders older than configured hours
    const { data: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.completed,status.eq.delivered,status.eq.entregado,status.eq.completado')
      .lt('updated_at', completedThreshold.toISOString());

    if (completedError) {
      throw new Error(`Error fetching completed orders: ${completedError.message}`);
    }
    
    // Archive cancelled orders older than configured hours
    const { data: cancelledOrders, error: cancelledError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.cancelled,status.eq.cancelado,status.eq.cancelada')
      .lt('updated_at', cancelledThreshold.toISOString());
      
    if (cancelledError) {
      throw new Error(`Error fetching cancelled orders: ${cancelledError.message}`);
    }
    
    // Archive test orders (pending/preparing orders older than configured hours, likely test data)
    const { data: testOrders, error: testError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.pending,status.eq.pendiente,status.eq.preparing,status.eq.preparando,status.eq.en preparación')
      .lt('created_at', testOrdersThreshold.toISOString());
      
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
      // Update last run time even if no orders were archived
      const now = new Date().toISOString();
      await supabase
        .from('system_settings')
        .upsert({ key: 'last_archive_run', value: now });
        
      return new Response(
        JSON.stringify({ message: 'No orders to archive', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each order to archive
    let processedCount = 0;
    let errorCount = 0;
    
    for (const order of ordersToArchive) {
      try {
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
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error);
        errorCount++;
      }
    }
    
    // Update last run time
    const lastRunTime = new Date().toISOString();
    await supabase
      .from('system_settings')
      .upsert({ key: 'last_archive_run', value: lastRunTime });

    return new Response(
      JSON.stringify({ 
        message: 'Archive process completed', 
        processed: processedCount,
        errors: errorCount,
        last_run: lastRunTime
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
