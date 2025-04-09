
import React from 'react';
import KitchenOrderCard from './KitchenOrderCard';
import { OrderDisplay } from './types';
import { NormalizedOrderStatus, getStatusLabel } from '@/utils/orderStatusUtils';

interface KitchenOrdersGridProps {
  orders: OrderDisplay[];
  orderStatus: NormalizedOrderStatus;
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
  getKitchenName: (kitchenId: string) => string;
  selectedKitchen: string;
  urgencyThreshold: number;
}

const KitchenOrdersGrid: React.FC<KitchenOrdersGridProps> = ({
  orders,
  orderStatus,
  hasManagePermission,
  updateOrderStatus,
  getKitchenName,
  selectedKitchen,
  urgencyThreshold
}) => {
  // Filter orders by current status tab
  const filteredOrders = orders.filter(order => order.status === orderStatus);
  
  // Sort orders based on priority and FIFO
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const createdAtA = new Date(a.createdAt).getTime();
    const createdAtB = new Date(b.createdAt).getTime();
    
    if (orderStatus === 'pending') {
      const now = new Date().getTime();
      
      // Calculate seconds passed for urgency detection
      const secondsPassedA = Math.floor((now - createdAtA) / 1000); 
      const secondsPassedB = Math.floor((now - createdAtB) / 1000);
      
      const minutesPassedA = secondsPassedA / 60;
      const minutesPassedB = secondsPassedB / 60;
      
      const isUrgentA = minutesPassedA >= urgencyThreshold;
      const isUrgentB = minutesPassedB >= urgencyThreshold;
      
      // Prioritize urgent orders
      if (isUrgentA && !isUrgentB) {
        return -1; // A (urgent) goes first
      } else if (!isUrgentA && isUrgentB) {
        return 1; // B (urgent) goes first
      }
    }
    
    // FIFO: oldest first
    return createdAtA - createdAtB;
  });
  
  console.log(`[KitchenOrdersGrid] Displaying ${sortedOrders.length} orders with status: ${orderStatus}. Urgency threshold: ${urgencyThreshold} minutes`);
  
  if (sortedOrders.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No hay órdenes <strong>{getStatusLabel(orderStatus).toLowerCase()}</strong> para{' '}
        <strong>{getKitchenName(selectedKitchen)}</strong>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {sortedOrders.map(order => {
        // Calculate time elapsed for logging
        const now = new Date();
        const created = new Date(order.createdAt);
        const secondsElapsed = Math.floor((now.getTime() - created.getTime()) / 1000);
        const minutesElapsed = (secondsElapsed / 60).toFixed(1);
        
        console.log(`[Order ${order.id.substring(0, 4)}] Created: ${order.createdAt}, Elapsed: ${minutesElapsed} minutes, Source: ${order.orderSource}`);
        
        return (
          <KitchenOrderCard
            key={order.id}
            order={order}
            kitchenName={getKitchenName(order.kitchenId)}
            orderStatus={orderStatus}
            hasManagePermission={hasManagePermission}
            updateOrderStatus={updateOrderStatus}
            urgencyThreshold={urgencyThreshold}
          />
        );
      })}
    </div>
  );
};

export default KitchenOrdersGrid;
