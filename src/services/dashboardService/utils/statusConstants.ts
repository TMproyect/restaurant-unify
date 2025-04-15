
// Order status groups for consistent categorization across the application
export const ORDER_STATUSES = {
  pending: ['pending', 'priority-pending', 'pendiente'],
  preparing: ['preparing', 'priority-preparing', 'preparando', 'en preparación'],
  ready: ['ready', 'listo', 'lista'],
  completed: ['ready'], // Only 'ready' counts as completed
  cancelled: ['cancelled', 'cancelado', 'cancelada']
} as const;
