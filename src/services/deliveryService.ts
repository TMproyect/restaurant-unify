
// This file is kept for backward compatibility
// All functionality is now in the delivery directory
import * as deliveryService from './delivery';

// Re-export everything
export const {
  // Queries
  getDeliveryOrders,
  
  // Mutations
  assignDeliveryDriver,
  markDeliveryCompleted,
  createDeliveryOrder,
  
  // Subscriptions
  subscribeToDeliveryUpdates
} = deliveryService;

// Export types
export type { DeliveryAddress, DeliveryOrder } from './delivery/types';
