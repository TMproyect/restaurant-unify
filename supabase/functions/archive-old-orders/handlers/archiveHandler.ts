
import { initSupabaseClient } from '../utils/supabaseClient.ts';
import { corsHeaders } from '../utils/cors.ts';
import { 
  getArchiveSettings,
  calculateThresholds
} from '../utils/settings.ts';
import { fetchOrdersToArchive } from '../services/orderFetcher.ts';
import { archiveOrders } from '../services/archiver.ts';
import { 
  updateLastRunTime,
  createNotification,
  formatDetails
} from '../services/notification.ts';

export const handleArchiveRequest = async (req: Request): Promise<Response> => {
  console.log('🔄 Starting order archiving process...');
  
  // Initialize Supabase client
  const supabase = initSupabaseClient();
  
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
  
  // Get archive settings
  const settings = await getArchiveSettings(supabase);
  
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
  
  // Calculate time thresholds
  const thresholds = calculateThresholds(settings);
  
  // Fetch orders to archive
  const ordersToArchive = await fetchOrdersToArchive(supabase, thresholds);
  
  console.log(`🔄 Found total of ${ordersToArchive.length} orders to archive`);

  if (ordersToArchive.length === 0) {
    // Update last run time even if no orders were archived
    const lastRunTime = await updateLastRunTime(supabase);
      
    return new Response(
      JSON.stringify({ message: 'No orders to archive', processed: 0, last_run: lastRunTime }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Archive orders
  const { processedCount, errorCount, statusCounts } = await archiveOrders(
    supabase, 
    ordersToArchive,
    thresholds.now
  );
  
  // Update last run time
  const lastRunTime = await updateLastRunTime(supabase);
  
  // Create notification
  await createNotification(supabase, processedCount, isManualInvocation);

  // Format details
  const details = formatDetails(statusCounts);

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
};
