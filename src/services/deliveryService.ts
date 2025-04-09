
// This file is kept for backward compatibility
// All functionality is now in the delivery directory
import * as deliveryService from './delivery';

// Re-export everything
export const {
  // Types
  DeliveryAddress,
  DeliveryOrder,
  
  // Queries
  getDeliveryOrders,
  
  // Mutations
  assignDeliveryDriver,
  markDeliveryCompleted,
  createDeliveryOrder,
  
  // Subscriptions
  subscribeToDeliveryUpdates
} = deliveryService;

export type { DeliveryAddress, DeliveryOrder };
