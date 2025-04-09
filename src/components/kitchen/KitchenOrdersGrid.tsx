
import React from 'react';
import KitchenOrderCard from './KitchenOrderCard';

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
  status: string;
  items: OrderItem[];
}

interface KitchenOrdersGridProps {
  orders: OrderDisplay[];
  orderStatus: 'pending' | 'preparing' | 'ready';
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
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
  if (orders.length === 0) {
    return (
      <div className="col-span-2 text-center py-10 text-muted-foreground">
        No hay órdenes {
          orderStatus === 'pending' ? 'pendientes' : 
          orderStatus === 'preparing' ? 'en preparación' : 
          'completadas'
        } para {getKitchenName(selectedKitchen)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {orders.map(order => (
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
