
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/order.types';
import StatusBadge from './StatusBadge';
import OrderActionMenu from './OrderActionMenu';

interface OrderTableRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  isArchived?: boolean;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({ 
  order, 
  onStatusChange,
  isArchived = false
}) => {
  console.log(`🔄 [OrderTableRow] Rendering row for order ${order.id}`);
  
  return (
    <tr 
      key={order.id}
      className={`hover:bg-muted/50 transition-colors ${isArchived ? 'bg-gray-50 dark:bg-gray-900/30' : ''}`}
    >
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <div className="font-medium">#{order.id?.substring(0, 4)}</div>
        <div className="text-muted-foreground">
          {order.is_delivery ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Delivery
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
              Mesa {order.table_number}
            </Badge>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        {order.customer_name}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <StatusBadge status={order.status} />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        {order.kitchen_id ? (
          <Badge variant="outline" className="bg-secondary/40 text-secondary-foreground">
            {order.kitchen_id === 'main' ? 'Principal' : 
             order.kitchen_id === 'bar' ? 'Bar' : 
             order.kitchen_id === 'grill' ? 'Parrilla' : 
             order.kitchen_id}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">Sin asignar</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
        ${order.total.toFixed(2)}
        {order.discount !== undefined && order.discount > 0 && (
          <div className="text-xs text-green-600">
            Descuento: {order.discount}%
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
        {order.created_at ? new Date(order.created_at).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '--:--'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
        <OrderActionMenu 
          orderId={order.id!} 
          status={order.status}
          onStatusChange={onStatusChange}
          isArchived={isArchived}
        />
      </td>
    </tr>
  );
};

export default OrderTableRow;
