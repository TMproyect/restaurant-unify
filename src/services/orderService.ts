
// Re-export all order service functionality from the orders modules
export * from '@/types/order.types';
export * from './orders';

// Add a console log to verify this module is loaded correctly
console.log('✅ [orderService] Module loaded successfully');
