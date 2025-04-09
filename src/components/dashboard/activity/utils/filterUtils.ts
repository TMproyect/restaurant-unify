
import { ActivityMonitorItem } from '@/types/dashboard.types';

// Constants for consistent categorization
const ACTIVE_STATUSES = [
  'pending', 'preparing', 'priority-pending', 'priority-preparing',
  'pendiente', 'preparando', 'en preparación'
];

const COMPLETED_STATUSES = [
  'delivered', 'completed', 'entregado', 'completado'
];

const CANCELLED_STATUSES = [
  'cancelled', 'cancelado', 'cancelada'
];

export const filterItems = (
  items: ActivityMonitorItem[] | undefined, 
  activeTab: string, 
  activeFilter: string | null
): ActivityMonitorItem[] => {
  if (!items || items.length === 0) {
    return [];
  }
  
  let filtered = [...items]; // Create a copy of the array
  
  // Filter by tab with CORRECT business logic
  if (activeTab === 'active') {
    // Active tab should ONLY show orders that require action (pending, preparing)
    // Explicitly exclude 'ready' status from active tab
    filtered = filtered.filter(item => ACTIVE_STATUSES.includes(item.status));
  } else if (activeTab === 'completed') {
    // Completed tab should ONLY show successfully completed orders
    // Explicitly exclude 'cancelled' status from completed tab
    filtered = filtered.filter(item => COMPLETED_STATUSES.includes(item.status));
  } else if (activeTab === 'cancelled') {
    // Add a new tab specifically for cancelled orders
    filtered = filtered.filter(item => CANCELLED_STATUSES.includes(item.status));
  } else if (activeTab === 'exceptions') {
    // Exceptions tab shows orders with special conditions requiring attention
    filtered = filtered.filter(item => 
      item.isDelayed || 
      item.hasCancellation || 
      (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
    );
  }
  
  // Apply additional filter if selected
  if (activeFilter === 'delayed') {
    filtered = filtered.filter(item => item.isDelayed);
  } else if (activeFilter === 'cancelled') {
    filtered = filtered.filter(item => item.hasCancellation);
  } else if (activeFilter === 'discounts') {
    filtered = filtered.filter(item => item.hasDiscount);
  } else if (activeFilter === 'kitchen') {
    filtered = filtered.filter(item => item.kitchenId && item.kitchenId !== '');
  }
  
  // Log for verification
  console.log(`📊 [ActivityMonitor] Items filtered (${activeTab}/${activeFilter || 'sin filtro'}): ${filtered.length}`);
  
  return filtered;
};

export const calculateItemsCount = (items: ActivityMonitorItem[] | undefined): Record<string, number> => {
  if (!items || items.length === 0) {
    return {
      all: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      exceptions: 0
    };
  }

  // Calculate counts using the SAME consistent logic as in filterItems
  const counts = {
    all: items.length,
    
    // Active: ONLY pending and preparing (items requiring action)
    active: items.filter(item => ACTIVE_STATUSES.includes(item.status)).length,
    
    // Completed: ONLY successfully completed orders (not cancelled)
    completed: items.filter(item => COMPLETED_STATUSES.includes(item.status)).length,
    
    // Add cancelled count
    cancelled: items.filter(item => CANCELLED_STATUSES.includes(item.status)).length,
    
    // Exceptions: any order with delay, cancellation or high discount
    exceptions: items.filter(item => 
      item.isDelayed || 
      item.hasCancellation || 
      (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
    ).length
  };
  
  // Log counts for verification
  console.log('📊 [ActivityMonitor] Item counts:', counts);
  
  return counts;
};
