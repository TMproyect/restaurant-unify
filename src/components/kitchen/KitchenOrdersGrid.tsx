
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
}

interface KitchenOrdersGridProps {
  orders: OrderDisplay[];
  orderStatus: NormalizedOrderStatus;
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
  getKitchenName: (kitchenId: string) => string;
  selectedKitchen: string;
}

const KitchenOrdersGrid: React.FC<KitchenOrdersGridProps> = ({
  orders,
  orderStatus,
  hasManagePermission,
  updateOrderStatus,
  getKitchenName,
  selectedKitchen
}) => {
  // Filtrar órdenes por estado actual para asegurar que solo mostramos las órdenes
  // que corresponden a la pestaña actual
  const filteredOrders = orders.filter(order => order.status === orderStatus);
  
  if (filteredOrders.length === 0) {
    return (
      <div className="col-span-2 text-center py-10 text-muted-foreground">
        No hay órdenes <strong>{getStatusLabel(orderStatus).toLowerCase()}</strong> para{' '}
        <strong>{getKitchenName(selectedKitchen)}</strong>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredOrders.map(order => (
        <KitchenOrderCard
          key={order.id}
          order={order}
          kitchenName={getKitchenName(order.kitchenId)}
          orderStatus={orderStatus}
          hasManagePermission={hasManagePermission}
          updateOrderStatus={updateOrderStatus}
        />
      ))}
    </div>
  );
};

export default KitchenOrdersGrid;
