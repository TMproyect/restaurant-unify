
import React from 'react';
import KitchenOrderCard from './KitchenOrderCard';
import { NormalizedOrderStatus, getStatusLabel } from '@/utils/orderStatusUtils';

interface OrderItem {
  id: string;
  name: string;
  notes: string;
  quantity: number;
}

interface OrderDisplay {
  id: string;
  table: string;
  customerName: string;
  time: string;
  kitchenId: string;
  status: NormalizedOrderStatus;
  items: OrderItem[];
  createdAt: string;
  orderSource: 'delivery' | 'qr_table' | 'pos' | null;
}

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
      
      // Calculate minutes passed for urgency detection
      const minutesPassedA = Math.floor((now - createdAtA) / (1000 * 60)); 
      const minutesPassedB = Math.floor((now - createdAtB) / (1000 * 60));
      
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
      {sortedOrders.map(order => (
        <KitchenOrderCard
          key={order.id}
          order={order}
          kitchenName={getKitchenName(order.kitchenId)}
          orderStatus={orderStatus}
          hasManagePermission={hasManagePermission}
          updateOrderStatus={updateOrderStatus}
          urgencyThreshold={urgencyThreshold}
        />
      ))}
    </div>
  );
};

export default KitchenOrdersGrid;
