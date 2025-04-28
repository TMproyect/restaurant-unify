
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivityMonitorItem } from '@/types/dashboard.types';

export const prioritizeOrder = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`🔄 [DashboardService] Prioritizing order ${orderId}`);
    
    // Get current status in a single query
    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('status, id')
      .eq('id', orderId)
      .single();
    
    if (getError) {
      console.error('❌ [DashboardService] Error getting order:', getError);
      throw getError;
    }
    
    if (!order) {
      console.error(`❌ [DashboardService] Order ${orderId} not found`);
      return false;
    }
    
    // Determine new status with mejor manejo de priorización
    let newStatus = order.status;
    const normalizedStatus = order.status.toLowerCase();
    
    if (normalizedStatus === 'pending' || normalizedStatus === 'pendiente') {
      newStatus = 'priority-pending';
    } else if (normalizedStatus === 'preparing' || normalizedStatus === 'preparando' || normalizedStatus === 'en preparación') {
      newStatus = 'priority-preparing';
    } else if (normalizedStatus.includes('pend')) {
      newStatus = 'priority-pending';
    } else if (normalizedStatus.includes('prepar')) {
      newStatus = 'priority-preparing';
    }
    
    console.log(`🔄 [DashboardService] Cambiando estado de orden ${orderId} de "${order.status}" a "${newStatus}"`);
    
    // Update only if status changed
    if (newStatus !== order.status) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('❌ [DashboardService] Error prioritizing order:', updateError);
        throw updateError;
      }
      
      console.log(`✅ [DashboardService] Order ${orderId} prioritized to "${newStatus}"`);
      return true;
    } else {
      console.log(`⚠️ [DashboardService] Order ${orderId} status was not changed because it's already in an appropriate state`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ [DashboardService] Error prioritizing order:', error);
    return false;
  }
};
