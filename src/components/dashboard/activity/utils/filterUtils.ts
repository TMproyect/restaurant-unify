
import { ActivityMonitorItem } from '@/types/dashboard.types';

// Status group definitions for consistent classification
const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
const readyStatuses = ['ready', 'listo', 'lista'];
const completedStatuses = ['completed', 'delivered', 'completado', 'entregado', 'paid'];
const cancelledStatuses = ['cancelled', 'cancelado', 'cancelada'];

// Active orders include pending, preparing and ready orders
const activeStatuses = [...pendingStatuses, ...preparingStatuses, ...readyStatuses];

/**
 * Filter items based on the selected tab, additional filter, and date range
 */
export const filterItems = (
  items: ActivityMonitorItem[] = [],
  activeTab = 'all',
  activeFilter: string | null = null,
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null }
): ActivityMonitorItem[] => {
  if (!items || items.length === 0) return [];
  
  // First apply date filter if provided
  let filteredItems = [...items];
  
  if (dateRange.start || dateRange.end) {
    filteredItems = filteredItems.filter(item => {
      const itemDate = new Date(item.timestamp);
      
      // If only start date is provided
      if (dateRange.start && !dateRange.end) {
        return itemDate >= dateRange.start;
      }
      
      // If only end date is provided
      if (!dateRange.start && dateRange.end) {
        return itemDate <= dateRange.end;
      }
      
      // If both dates are provided
      if (dateRange.start && dateRange.end) {
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      }
      
      return true;
    });
    
    console.log(`📊 [filterItems] Date filtered: ${filteredItems.length}/${items.length} items remaining`);
  }
  
  // Then filter by tab
  switch (activeTab) {
    case 'active':
      // Active includes pending, preparing, and ready orders
      filteredItems = filteredItems.filter(item => 
        activeStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'completed':
      // CORRECTED: Only completed/delivered orders (not cancelled)
      filteredItems = filteredItems.filter(item => 
        completedStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'cancelled':
      // Only cancelled orders
      filteredItems = filteredItems.filter(item => 
        cancelledStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'exceptions':
      // Orders with any exception
      filteredItems = filteredItems.filter(item => 
        item.isDelayed || item.hasCancellation || 
        (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
      );
      break;
    // 'all' - no filtering needed
  }
  
  // Apply additional filters
  if (activeFilter) {
    switch (activeFilter) {
      case 'delayed':
        filteredItems = filteredItems.filter(item => item.isDelayed);
        break;
      case 'cancelled':
        filteredItems = filteredItems.filter(item => item.hasCancellation);
        break;
      case 'discounts':
        filteredItems = filteredItems.filter(item => 
          item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15
        );
        break;
      case 'kitchen':
        filteredItems = filteredItems.filter(item => !!item.kitchenId);
        break;
    }
  }
  
  console.log(`📊 [filterItems] Filtered: tab=${activeTab}, filter=${activeFilter}, dateRange=${!!dateRange.start}, items=${filteredItems.length}/${items.length}`);
  return filteredItems;
};

/**
 * Calculate the count of items for each category
 */
export const calculateItemsCount = (
  items: ActivityMonitorItem[] = [],
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null }
): Record<string, number> => {
  if (!items || items.length === 0) {
    return {
      all: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      exceptions: 0
    };
  }
  
  // Apply date filter first if provided
  let filteredItems = [...items];
  
  if (dateRange.start || dateRange.end) {
    filteredItems = filteredItems.filter(item => {
      const itemDate = new Date(item.timestamp);
      
      // If only start date is provided
      if (dateRange.start && !dateRange.end) {
        return itemDate >= dateRange.start;
      }
      
      // If only end date is provided
      if (!dateRange.start && dateRange.end) {
        return itemDate <= dateRange.end;
      }
      
      // If both dates are provided
      if (dateRange.start && dateRange.end) {
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      }
      
      return true;
    });
  }
  
  // Count correctly according to status definitions
  const all = filteredItems.length;
  
  const active = filteredItems.filter(item => 
    activeStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const completed = filteredItems.filter(item => 
    completedStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const cancelled = filteredItems.filter(item => 
    cancelledStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const exceptions = filteredItems.filter(item => 
    item.isDelayed || 
    item.hasCancellation || 
    (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
  ).length;
  
  return {
    all,
    active,
    completed,
    cancelled,
    exceptions
  };
};

// Export constants for reuse
export {
  pendingStatuses,
  preparingStatuses,
  readyStatuses,
  completedStatuses,
  cancelledStatuses,
  activeStatuses
};
