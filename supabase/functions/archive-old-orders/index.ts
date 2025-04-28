
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
      console.log(`📌 Action requested: ${action}`);
    } catch (e) {
      // If no valid JSON body or no action specified, default to run-now
      console.log('⚠️ No valid JSON body in request, using default action run-now');
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
        console.error(`❌ Error fetching archive settings: ${settingsError.message}`);
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
    
    // Fetch archiving settings
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
      console.error(`❌ Error fetching archive settings: ${settingsError.message}`);
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
    
    console.log(`📊 Archive settings:`, settings);
    
    // If auto archive is disabled and this isn't a manual invocation, exit
    const isManualInvocation = action === 'run-now';
    const isScheduledInvocation = action === 'run-scheduled';
    
    if (!settings.auto_archive_enabled && isScheduledInvocation) {
      console.log('🔍 Auto-archiving is disabled, exiting early');
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

    // 1. Find completed orders to archive
    const { data: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('*')
      .or('status.eq.completed,status.eq.delivered,status.eq.entregado,status.eq.completado')
      .lt('updated_at', completedThreshold.toISOString())
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
      .lt('updated_at', cancelledThreshold.toISOString())
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
      .lt('created_at', testOrdersThreshold.toISOString())
      .not('status', 'eq', 'archived');
      
    if (testError) {
      console.error(`❌ Error fetching test orders: ${testError.message}`);
      throw new Error(`Error fetching test orders: ${testError.message}`);
    }
    
    console.log(`🔍 Found ${testOrders?.length || 0} abandoned test orders to archive`);

    // Combine all orders to archive
    const ordersToArchive = [
      ...(completedOrders || []),
      ...(cancelledOrders || []),
      ...(testOrders || [])
    ];
    
    console.log(`🔄 Found total of ${ordersToArchive.length} orders to archive`);

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
    let details = {};
    
    // Group orders by status for detailed reporting
    const statusCounts = {
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
    
    // Update last run time
    const lastRunTime = new Date().toISOString();
    await supabase
      .from('system_settings')
      .upsert({ key: 'last_archive_run', value: lastRunTime });
      
    // Create a notification about the archiving
    if (processedCount > 0) {
      try {
        await supabase.from('notifications').insert({
          title: isManualInvocation ? 'Archivado manual' : 'Archivado automático',
          description: `Se archivaron ${processedCount} órdenes antiguas`,
          type: 'system',
          user_id: '00000000-0000-0000-0000-000000000000', // System notification
          read: false,
          action_text: 'Ver órdenes archivadas',
          link: '/orders?archived=true'
        });
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError);
      }
    }

    details = {
      ...statusCounts,
      total: processedCount
    };

    return new Response(
      JSON.stringify({ 
        message: 'Archive process completed', 
        processed: processedCount,
        errors: errorCount,
        last_run: lastRunTime,
        details: details
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
