
import { useState } from 'react';
import { useKitchenOrders } from './useKitchenOrders';
import { useKitchenStatus } from './useKitchenStatus';
import { useKitchenUtils } from '../utils/kitchenUtils';
import { useKitchenPermissions } from './useKitchenPermissions';
import { KITCHEN_OPTIONS } from '../types/kitchenTypes';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { KitchenTabStatus, UseKitchenDataReturn } from '../types/kitchenTypes';

export { KITCHEN_OPTIONS as kitchenOptions };

export const useKitchenData = (): UseKitchenDataReturn => {
  const [selectedKitchen, setSelectedKitchen] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get permissions
  const { hasViewPermission, hasManagePermission } = useKitchenPermissions();
  
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
    updateOrderStatusInKitchen
  };
};
