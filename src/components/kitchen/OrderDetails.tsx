
import React from 'react';
import { OrderItem } from './kitchenTypes';
import { NormalizedOrderStatus, getStatusLabel } from '@/utils/orderStatusUtils';

interface OrderDetailsProps {
  order: {
    id: string;
    table: string;
    customerName: string;
    time: string;
    kitchenId: string;
    status: NormalizedOrderStatus;
    items: OrderItem[];
    createdAt: string;
    orderSource: 'delivery' | 'qr_table' | 'pos' | null;
  };
  kitchenName: string;
  orderStatus: NormalizedOrderStatus;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  kitchenName,
  orderStatus
}) => {
  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Cliente</p>
          <p className="font-medium">{order.customerName}</p>
        </div>
        <div>
          <p className="text-gray-500">Mesa</p>
          <p className="font-medium">{order.table}</p>
        </div>
        <div>
          <p className="text-gray-500">Hora de pedido</p>
          <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Cocina</p>
          <p className="font-medium">{kitchenName}</p>
        </div>
        <div>
          <p className="text-gray-500">Estado</p>
          <p className="font-medium">{getStatusLabel(orderStatus)}</p>
        </div>
        <div>
          <p className="text-gray-500">Fuente</p>
          <p className="font-medium">
            {order.orderSource === 'delivery' ? 'Delivery' : 
             order.orderSource === 'qr_table' ? 'QR Mesa' : 
             order.orderSource === 'pos' ? 'POS' : 'Desconocido'}
          </p>
        </div>
      </div>
      
      <div>
        <p className="text-gray-500 mb-2">Productos</p>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li key={index} className="p-2 border rounded-md">
              <div className="flex justify-between font-medium">
                <span>{item.name}</span>
                {item.quantity > 1 && (
                  <span className="bg-secondary px-1.5 rounded-full text-xs">
                    x{item.quantity}
                  </span>
                )}
              </div>
              {item.notes && (
                <div className="mt-1 p-1 bg-amber-100 text-amber-800 rounded text-xs border border-amber-200">
                  <p className="font-medium">{item.notes}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetails;
