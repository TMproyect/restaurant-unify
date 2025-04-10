
import { ActivityMonitorItem } from '@/types/dashboard.types';

// Status group definitions for consistent classification
const pendingStatuses = ['pending', 'priority-pending', 'pendiente'];
const preparingStatuses = ['preparing', 'priority-preparing', 'preparando', 'en preparación'];
const readyStatuses = ['ready', 'listo', 'lista'];
const completedStatuses = ['completed', 'delivered', 'completado', 'entregado', 'paid'];
const cancelledStatuses = ['cancelled', 'cancelado', 'cancelada'];

// Active orders are only pending and preparing
const activeStatuses = [...pendingStatuses, ...preparingStatuses];

/**
 * Filter items based on the selected tab and additional filter
 */
export const filterItems = (
  items: ActivityMonitorItem[] = [],
  activeTab = 'all',
  activeFilter: string | null = null
): ActivityMonitorItem[] => {
  if (!items || items.length === 0) return [];
  
  // Filter by tab
  let filteredItems = [...items];
  
  switch (activeTab) {
    case 'active':
      // CORRECCIÓN: Solo pedidos pendientes y en preparación (no listos)
      filteredItems = items.filter(item => 
        activeStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'completed':
      // CORRECCIÓN: Solo pedidos completados/entregados (no cancelados)
      filteredItems = items.filter(item => 
        completedStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'cancelled':
      // Solo pedidos cancelados
      filteredItems = items.filter(item => 
        cancelledStatuses.includes(item.status.toLowerCase())
      );
      break;
    case 'exceptions':
      // CORRECCIÓN: Pedidos con cualquier excepción
      filteredItems = items.filter(item => 
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
  
  console.log(`📊 [filterItems] Filtrado: tab=${activeTab}, filter=${activeFilter}, items=${filteredItems.length}/${items.length}`);
  return filteredItems;
};

/**
 * Calculate the count of items for each category
 */
export const calculateItemsCount = (items: ActivityMonitorItem[] = []): Record<string, number> => {
  if (!items || items.length === 0) {
    return {
      all: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      exceptions: 0
    };
  }
  
  // CORRECCIÓN: Contar correctamente según definiciones de estado
  const all = items.length;
  
  const active = items.filter(item => 
    activeStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const completed = items.filter(item => 
    completedStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const cancelled = items.filter(item => 
    cancelledStatuses.includes(item.status.toLowerCase())
  ).length;
  
  const exceptions = items.filter(item => 
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

// Exportar constantes para reutilización
export {
  pendingStatuses,
  preparingStatuses,
  readyStatuses,
  completedStatuses,
  cancelledStatuses,
  activeStatuses
};
