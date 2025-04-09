
import { OrderDisplay } from '@/components/kitchen/kitchenTypes';
import { 
  calculateKitchenStats, 
  filterOrdersByStatus 
} from '@/services/kitchen/kitchenStatsService';
import { getAveragePreparationTime, getKitchenName as getKitchenNameService } from '@/services/kitchen/kitchenService';
import { KITCHEN_OPTIONS } from '../types/kitchenTypes';
import { KitchenTabStatus } from '../types/kitchenTypes';

export const useKitchenUtils = (orders: OrderDisplay[], selectedKitchen: string) => {
  // Get filtered orders based on status
  const getFilteredOrders = (status: KitchenTabStatus) => {
    return filterOrdersByStatus(orders, status);
  };

  // Get statistics for the selected kitchen
  const getKitchenStats = () => {
    return calculateKitchenStats(orders);
  };

  // Calculate average preparation time
  const getAverageTime = () => {
    return getAveragePreparationTime(selectedKitchen);
  };

  // Get kitchen name from ID
  const getKitchenName = (kitchenId: string) => {
    return getKitchenNameService(kitchenId, KITCHEN_OPTIONS);
  };

  return {
    getFilteredOrders,
    getKitchenStats,
    getAverageTime,
    getKitchenName
  };
};
