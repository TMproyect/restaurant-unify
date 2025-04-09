
import { useState, useEffect } from 'react';
import { useKitchenOrders } from './useKitchenOrders';
import { useKitchenStatus } from './useKitchenStatus';
import { useKitchenUtils } from '../utils/kitchenUtils';
import { useKitchenPermissions } from './useKitchenPermissions';
import { KITCHEN_OPTIONS } from '../types/kitchenTypes';
import { supabase } from '@/integrations/supabase/client';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { KitchenTabStatus, UseKitchenDataReturn } from '../types/kitchenTypes';

export { KITCHEN_OPTIONS as kitchenOptions };

export const useKitchenData = (): UseKitchenDataReturn => {
  const [selectedKitchen, setSelectedKitchen] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [urgencyThreshold, setUrgencyThreshold] = useState(15); // Default to 15 minutes
  
  // Get permissions
  const { hasViewPermission, hasManagePermission } = useKitchenPermissions();
  
  // Load urgency threshold setting from Supabase
  useEffect(() => {
    const loadUrgencyThreshold = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'kitchen_urgency_threshold_minutes')
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error loading urgency threshold:', error);
          }
          return;
        }
        
        if (data && data.value) {
          const threshold = parseInt(data.value);
          if (!isNaN(threshold) && threshold > 0) {
            console.log(`🔄 [Kitchen] Loaded urgency threshold: ${threshold} minutes`);
            setUrgencyThreshold(threshold);
          }
        }
      } catch (error) {
        console.error('Failed to load urgency threshold:', error);
      }
    };
    
    loadUrgencyThreshold();
  }, []);
  
  // Function to refresh data
  const handleRefresh = () => {
    console.log('🔄 [Kitchen] Refreshing orders list');
    setRefreshKey(prev => prev + 1);
  };
  
  // Get orders data
  const { orders, loading, fetchOrders } = useKitchenOrders(
    selectedKitchen,
    refreshKey,
    hasViewPermission
  );
  
  // Handle order status
  const { orderStatus, setOrderStatus, updateOrderStatusHandler } = useKitchenStatus(
    hasManagePermission,
    fetchOrders
  );
  
  // Utility functions
  const { getFilteredOrders, getKitchenStats, getAverageTime, getKitchenName } = useKitchenUtils(
    orders,
    selectedKitchen
  );
  
  // Final update status handler with local state update
  const updateOrderStatusInKitchen = async (orderId: string, newStatus: NormalizedOrderStatus) => {
    updateOrderStatusHandler(orderId, newStatus);
  };

  return {
    selectedKitchen,
    setSelectedKitchen,
    orderStatus,
    setOrderStatus: (status: KitchenTabStatus) => {
      setOrderStatus(status);
    },
    orders: getFilteredOrders(orderStatus),
    loading,
    refreshKey,
    handleRefresh,
    hasViewPermission,
    hasManagePermission,
    getKitchenStats,
    getAverageTime,
    getKitchenName,
    updateOrderStatusInKitchen,
    urgencyThreshold,
    setUrgencyThreshold
  };
};
