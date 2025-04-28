
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface OrderData {
  id: string;
  status: string;
  customer_name: string;
  created_at: string;
  total: number;
  discount?: number;
  items_count: number;
  kitchen_id?: string;
  order_source?: string;
}

export function mapOrderToActivityItem(order: OrderData): ActivityMonitorItem {
  const createdAt = new Date(order.created_at);
  const now = new Date();
  const timeElapsedMs = now.getTime() - createdAt.getTime();
  
  const status = order.status.toLowerCase();
  
  // Check if it's a pending order                     
  const isPendingStatus = status === 'pending' || 
                       status === 'priority-pending' || 
                       status === 'pendiente';
  
  // Check if it's a preparing order                       
  const isPreparingStatus = status === 'preparing' || 
                         status === 'priority-preparing' || 
                         status === 'preparando' || 
                         status === 'en preparación';
                         
  // Determine delay thresholds based on status
  let delayThreshold = 15 * 60 * 1000; // Default 15 minutes
  
  if (isPendingStatus) {
    delayThreshold = 10 * 60 * 1000; // 10 minutes for pending
  } else if (isPreparingStatus) {
    delayThreshold = 20 * 60 * 1000; // 20 minutes for preparing
  }

  // Check if the order has a priority prefix
  const isPrioritized = status.startsWith('priority-');
  
  // Use enhanced delay thresholds
  const isDelayed = timeElapsedMs > delayThreshold && 
    (isPendingStatus || isPreparingStatus);
  
  const hasCancellation = status.includes('cancel');
  
  // Calculate discount percentage
  const hasDiscount = order.discount && order.discount > 0;
  const discountPercentage = hasDiscount ? 
    Math.round((order.discount / (order.total + order.discount)) * 100) : 0;
  
  // Generate actions based on status
  const actions: string[] = [`view:${order.id}`];
  
  if (isPendingStatus || isPreparingStatus) {
    if (!isPrioritized) {
      actions.push(`prioritize:${order.id}`);
    }
  }
  
  if (!hasCancellation) {
    actions.push(`review-cancel:${order.id}`);
  }
  
  if (hasDiscount && discountPercentage >= 15) {
    actions.push(`review-discount:${order.id}`);
  }

  return {
    id: order.id,
    type: 'order',
    customer: order.customer_name,
    status: status,
    timestamp: order.created_at,
    total: order.total || 0,
    itemsCount: order.items_count || 0,
    timeElapsed: timeElapsedMs,
    isDelayed,
    hasCancellation,
    hasDiscount,
    discountPercentage: hasDiscount ? discountPercentage : undefined,
    actions,
    kitchenId: order.kitchen_id || '',
    orderSource: order.order_source || 'pos',
    isPrioritized
  };
}
