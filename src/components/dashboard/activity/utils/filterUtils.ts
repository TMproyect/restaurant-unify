
import { ActivityMonitorItem } from '@/types/dashboard.types';

export const filterItems = (
  items: ActivityMonitorItem[] | undefined, 
  activeTab: string, 
  activeFilter: string | null
): ActivityMonitorItem[] => {
  if (!items || items.length === 0) {
    return [];
  }
  
  let filtered = [...items]; // Crear una copia del array para no afectar el original
  
  // Filter by tab
  if (activeTab === 'active') {
    filtered = filtered.filter(item => 
      item.status === 'pending' || 
      item.status === 'preparing' || 
      item.status === 'ready' ||
      item.status === 'priority-pending' ||
      item.status === 'priority-preparing' ||
      item.status === 'pendiente' ||
      item.status === 'preparando' ||
      item.status === 'en preparación' ||
      item.status === 'listo'
    );
  } else if (activeTab === 'completed') {
    filtered = filtered.filter(item => 
      item.status === 'delivered' || 
      item.status === 'completed' || 
      item.status === 'cancelled' ||
      item.status === 'entregado' ||
      item.status === 'completado' ||
      item.status === 'cancelado'
    );
  } else if (activeTab === 'exceptions') {
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
  
  // Log para verificar la cantidad de items filtrados
  console.log(`📊 [ActivityMonitor] Items filtrados (${activeTab}/${activeFilter || 'sin filtro'}): ${filtered.length}`);
  
  return filtered;
};

export const calculateItemsCount = (items: ActivityMonitorItem[] | undefined): Record<string, number> => {
  if (!items || items.length === 0) {
    return {
      all: 0,
      active: 0,
      completed: 0,
      exceptions: 0
    };
  }

  const counts = {
    all: items.length,
    active: items.filter(item => 
      item.status === 'pending' || 
      item.status === 'preparing' || 
      item.status === 'ready' ||
      item.status === 'priority-pending' ||
      item.status === 'priority-preparing' ||
      item.status === 'pendiente' ||
      item.status === 'preparando' ||
      item.status === 'en preparación' ||
      item.status === 'listo'
    ).length,
    completed: items.filter(item => 
      item.status === 'delivered' || 
      item.status === 'completed' || 
      item.status === 'cancelled' ||
      item.status === 'entregado' ||
      item.status === 'completado' ||
      item.status === 'cancelado'
    ).length,
    exceptions: items.filter(item => 
      item.isDelayed || 
      item.hasCancellation || 
      (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
    ).length
  };
  
  return counts;
};
