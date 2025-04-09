
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { OrderItem } from './kitchenTypes';

interface OrderItemDisplayProps {
  item: OrderItem;
  orderStatus: 'pending' | 'preparing' | 'ready';
}

const OrderItemDisplay: React.FC<OrderItemDisplayProps> = ({ item, orderStatus }) => {
  return (
    <li className="p-3 rounded bg-secondary/30">
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="font-medium">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</p>
          {item.notes && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
              <AlertCircle size={12} />
              <p>{item.notes}</p>
            </div>
          )}
        </div>
        {orderStatus === 'ready' && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
            Completado
          </span>
        )}
      </div>
    </li>
  );
};

export default OrderItemDisplay;
