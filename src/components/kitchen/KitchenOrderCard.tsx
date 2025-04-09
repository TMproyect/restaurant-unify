
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import ActionButton from './ActionButton';
import OrderItemDisplay from './OrderItemDisplay';
import { OrderItem } from './kitchenTypes';
import { NormalizedOrderStatus, getStatusLabel } from '@/utils/orderStatusUtils';
import { Clock, Calendar } from 'lucide-react';

interface KitchenOrderCardProps {
  order: {
    id: string;
    table: string;
    customerName: string;
    time: string;
    kitchenId: string;
    status: NormalizedOrderStatus;
    items: OrderItem[];
  };
  kitchenName: string;
  orderStatus: NormalizedOrderStatus;
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  kitchenName,
  orderStatus,
  hasManagePermission,
  updateOrderStatus
}) => {
  // Determinar la clase de borde basada en el estado
  const getCardStyles = () => {
    switch (orderStatus) {
      case 'pending':
        return {
          borderClass: 'border-l-4 border-l-yellow-500',
          bgClass: 'bg-yellow-50',
          textClass: 'text-yellow-800',
          statusBadgeClass: 'bg-yellow-100 text-yellow-800'
        };
      case 'preparing':
        return {
          borderClass: 'border-l-4 border-l-blue-500',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          statusBadgeClass: 'bg-blue-100 text-blue-800'
        };
      case 'ready':
        return {
          borderClass: 'border-l-4 border-l-green-500',
          bgClass: 'bg-green-50',
          textClass: 'text-green-800',
          statusBadgeClass: 'bg-green-100 text-green-800'
        };
      default:
        return {
          borderClass: '',
          bgClass: '',
          textClass: '',
          statusBadgeClass: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const styles = getCardStyles();

  return (
    <Card className={`hover:shadow-md transition-shadow ${styles.borderClass} ${styles.bgClass}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <span className="font-bold mr-2">#{order.id.substring(0, 4)}</span>
            <span className="text-base font-normal">
              Mesa {order.table}
            </span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${styles.statusBadgeClass}`}>
              {getStatusLabel(orderStatus)}
            </span>
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={14} className="mr-1" />
            <span>{order.time}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm flex items-center">
            <Calendar size={14} className="mr-1" />
            <span className="font-medium">Cliente:</span> 
            <span className="ml-1">{order.customerName}</span>
          </p>
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
