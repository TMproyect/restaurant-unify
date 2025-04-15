
import { useState, useEffect } from 'react';
import { useKitchenOrders } from './useKitchenOrders';
import { useKitchenStatus } from './useKitchenStatus';
import { useKitchenUtils } from '../utils/kitchenUtils';
import { useKitchenPermissions } from './useKitchenPermissions';
import { KITCHEN_OPTIONS, KitchenTabStatus, UseKitchenDataReturn } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { updateOrderStatusInKitchen } from '@/services/kitchen/kitchenService';

export { KITCHEN_OPTIONS as kitchenOptions };

export const useKitchenData = (): UseKitchenDataReturn => {
  const [selectedKitchen, setSelectedKitchen] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [urgencyThreshold, setUrgencyThreshold] = useState(15); // Default to 15 minutes
  const [showOnlyToday, setShowOnlyToday] = useState(true); // Por defecto, mostrar solo órdenes de hoy
  
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
    hasViewPermission,
    showOnlyToday
  );
  
  // Handle order status
  const { orderStatus, setOrderStatus, updateOrderStatusHandler } = useKitchenStatus(
    hasManagePermission,
    fetchOrders
  );
  
  // Utility functions
  const { getFilteredOrders, getKitchenStats, getAverageTime, getAverageTimeForStatus, getKitchenName } = useKitchenUtils(
    orders,
    selectedKitchen
  );
  
  // Final update status handler with local state update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: NormalizedOrderStatus) => {
    const success = await updateOrderStatusInKitchen(orderId, newStatus, hasManagePermission);
    if (success) {
      updateOrderStatusHandler(orderId, newStatus);
    }
    return success;
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
    getAverageTimeForStatus,
    getKitchenName,
    updateOrderStatusInKitchen: handleUpdateOrderStatus,
    urgencyThreshold,
    setUrgencyThreshold,
    showOnlyToday,
    setShowOnlyToday
  };
};
