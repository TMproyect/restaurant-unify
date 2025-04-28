
import { ActivityMonitorItem } from '@/types/dashboard.types';

export const filterItems = (
  items: ActivityMonitorItem[],
  status: string,
  activeFilter: string | null,
  dateRange: { start: Date | null; end: Date | null }
): ActivityMonitorItem[] => {
  if (!items) return [];
  
  return items.filter(item => {
    // Date range filter
    if (dateRange.start || dateRange.end) {
      const itemDate = new Date(item.timestamp);
      
      if (dateRange.start && itemDate < dateRange.start) {
        return false;
      }
      
      if (dateRange.end) {
        const endDatePlus1 = new Date(dateRange.end);
        endDatePlus1.setDate(endDatePlus1.getDate() + 1);
        if (itemDate > endDatePlus1) {
          return false;
        }
      }
    }
    
    // Status filter
    if (status !== 'all') {
      if (status === 'active' && 
          (item.status === 'completed' || item.status === 'cancelled')) {
        return false;
      } else if (status === 'completed' && item.status !== 'completed') {
        return false;
      } else if (status === 'cancelled' && item.status !== 'cancelled') {
        return false;
      } else if (status === 'exceptions' && 
                !item.isDelayed && 
                !item.hasCancellation && 
                !(item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)) {
        return false;
      }
    }
    
    // Additional filter
    if (activeFilter) {
      if (activeFilter === 'delayed' && !item.isDelayed) {
        return false;
      } else if (activeFilter === 'cancelled' && !item.hasCancellation) {
        return false;
      } else if (activeFilter === 'discounts' && 
                !(item.hasDiscount && item.discountPercentage && item.discountPercentage > 0)) {
        return false;
      } else if (activeFilter === 'kitchen' && !item.kitchenId) {
        return false;
      } else if (activeFilter === 'archivable' && !isOrderArchivable(item)) {
        return false;
      }
    }
    
    return true;
  });
};

export const calculateItemsCount = (
  items: ActivityMonitorItem[], 
  dateRange: { start: Date | null; end: Date | null }
): Record<string, number> => {
  const filteredByDate = filterByDateRange(items, dateRange);
  
  return {
    all: filteredByDate.length,
    active: filteredByDate.filter(item => 
      item.status !== 'completed' && 
      item.status !== 'cancelled'
    ).length,
    completed: filteredByDate.filter(item => 
      item.status === 'completed'
    ).length,
    cancelled: filteredByDate.filter(item => 
      item.status === 'cancelled'
    ).length,
    exceptions: filteredByDate.filter(item => 
      item.isDelayed || 
      item.hasCancellation || 
      (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
    ).length,
    archivable: filteredByDate.filter(item => isOrderArchivable(item)).length
  };
};

const filterByDateRange = (
  items: ActivityMonitorItem[], 
  dateRange: { start: Date | null; end: Date | null }
): ActivityMonitorItem[] => {
  if (!dateRange.start && !dateRange.end) return items;
  
  return items.filter(item => {
    const itemDate = new Date(item.timestamp);
    
    if (dateRange.start && itemDate < dateRange.start) {
      return false;
    }
    
    if (dateRange.end) {
      const endDatePlus1 = new Date(dateRange.end);
      endDatePlus1.setDate(endDatePlus1.getDate() + 1);
      if (itemDate > endDatePlus1) {
        return false;
      }
    }
    
    return true;
  });
};

// Determine if an order is archivable based on its status and age
export const isOrderArchivable = (item: ActivityMonitorItem): boolean => {
  const now = new Date();
  const itemDate = new Date(item.timestamp);
  const hoursElapsed = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
  
  // Orders are archivable if:
  // - Completed orders older than 24 hours
  // - Cancelled orders older than 48 hours
  // - Pending/preparing orders older than 12 hours (likely test orders)
  
  if (item.status === 'completed' && hoursElapsed >= 24) {
    return true;
  }
  
  if (item.status === 'cancelled' && hoursElapsed >= 48) {
    return true;
  }
  
  if (['pending', 'preparing'].includes(item.status) && hoursElapsed >= 12) {
    return true;
  }
  
  return false;
};
