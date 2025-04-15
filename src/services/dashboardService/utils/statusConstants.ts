
// Order status groups for consistent categorization across the application
export const ORDER_STATUSES = {
  pending: ['pending', 'priority-pending', 'pendiente'],
  preparing: ['preparing', 'priority-preparing', 'preparando', 'en preparación'],
  ready: ['ready', 'listo', 'lista'],
  completed: ['completed', 'delivered', 'completado', 'entregado', 'paid'], // Updated to include all completed states
  cancelled: ['cancelled', 'cancelado', 'cancelada']
} as const;
