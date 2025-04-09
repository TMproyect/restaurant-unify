
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import ActionButton from './ActionButton';
import OrderItemDisplay from './OrderItemDisplay';
import { OrderItem } from './kitchenTypes';

interface KitchenOrderCardProps {
  order: {
    id: string;
    table: string;
    customerName: string;
    time: string;
    kitchenId: string;
    status: string;
    items: OrderItem[];
  };
  kitchenName: string;
  orderStatus: 'pending' | 'preparing' | 'ready';
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  kitchenName,
  orderStatus,
  hasManagePermission,
  updateOrderStatus
}) => {
  // Determinar la clase de borde basada en el estado
  const getBorderClass = () => {
    switch (orderStatus) {
      case 'pending':
        return 'border-l-4 border-l-yellow-500';
      case 'preparing':
        return 'border-l-4 border-l-blue-500';
      case 'ready':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${getBorderClass()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Orden #{order.id.substring(0, 4)} - {order.table}</CardTitle>
          <span className="text-sm text-muted-foreground">{order.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
          <div className="flex gap-2">
            <p className="text-xs bg-secondary/50 px-2 py-1 rounded">
              {kitchenName}
            </p>
            <ActionButton 
              orderStatus={orderStatus}
              hasManagePermission={hasManagePermission}
              orderId={order.id}
              updateOrderStatus={updateOrderStatus}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <OrderItemDisplay 
              key={index} 
              item={item} 
              orderStatus={orderStatus} 
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default KitchenOrderCard;
