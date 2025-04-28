
import { ActivityMonitorItem } from '@/types/dashboard.types';

// Status group definitions for consistent classification
const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
const readyStatuses = ['ready', 'listo', 'lista'];
const completedStatuses = ['completed', 'delivered', 'completado', 'entregado', 'paid'];
const cancelledStatuses = ['cancelled', 'cancelado', 'cancelada'];

// Active orders include pending, preparing and ready orders
const activeStatuses = [...pendingStatuses, ...preparingStatuses];

// IMPORTANTE: Los pedidos "ready" ahora se consideran "completed" en el monitor de actividad
// pero siguen siendo "active" en otros contextos como la cocina

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
      // Active incluye sólo pending y preparing (no ready)
      filteredItems = filteredItems.filter(item => 
        activeStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'completed':
      // CORRECCIÓN: Incluir órdenes "ready" y "completed"
      filteredItems = filteredItems.filter(item => 
        completedStatuses.includes(item.status.toLowerCase()) || 
        readyStatuses.includes(item.status.toLowerCase())
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
        (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15) ||
        isArchivable(item)
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
      case 'archivable':
        filteredItems = filteredItems.filter(item => isArchivable(item));
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
  
  // Active son solo pending y preparing (no ready)
  const active = filteredItems.filter(item => 
    activeStatuses.includes(item.status.toLowerCase())
  ).length;
  
  // Ready y completados van juntos en la vista de actividad
  const completed = filteredItems.filter(item => 
    completedStatuses.includes(item.status.toLowerCase()) ||
    readyStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const cancelled = filteredItems.filter(item => 
    cancelledStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const exceptions = filteredItems.filter(item => 
    item.isDelayed || 
    item.hasCancellation || 
    (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15) ||
    isArchivable(item)
  ).length;
  
  return {
    all,
    active,
    completed,
    cancelled,
    exceptions
  };
};

/**
 * Determines if an order should be archived soon based on its status and age
 */
function isArchivable(item: ActivityMonitorItem): boolean {
  const milliseconds = item.timeElapsed;
  const minutes = milliseconds / (1000 * 60);
  const hours = minutes / 60;
  
  const status = item.status.toLowerCase();
  
  // Completed orders older than 20 hours
  if ((completedStatuses.includes(status) || readyStatuses.includes(status)) && hours > 20) {
    return true;
  }
  
  // Cancelled orders older than 40 hours
  if (cancelledStatuses.includes(status) && hours > 40) {
    return true;
  }
  
  // Test orders (pending/preparing older than 8 hours)
  if ((pendingStatuses.includes(status) || preparingStatuses.includes(status)) && hours > 8) {
    return true;
  }
  
  return false;
}

// Export constants for reuse
export {
  pendingStatuses,
  preparingStatuses,
  readyStatuses,
  completedStatuses,
  cancelledStatuses,
  activeStatuses
};
