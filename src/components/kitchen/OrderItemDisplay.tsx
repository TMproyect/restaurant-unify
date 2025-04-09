
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { OrderItem } from './kitchenTypes';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface OrderItemDisplayProps {
  item: OrderItem;
  orderStatus: NormalizedOrderStatus;
}

const OrderItemDisplay: React.FC<OrderItemDisplayProps> = ({ item, orderStatus }) => {
  // Set status-specific styles
  const getContainerClass = () => {
    switch (orderStatus) {
      case 'pending':
        return 'border-l-2 border-l-gray-400 bg-gray-50/50 p-2 rounded-md';
      case 'preparing':
        return 'border-l-2 border-l-blue-500 bg-blue-50/50 p-2 rounded-md';
      case 'ready':
        return 'border-l-2 border-l-green-500 bg-green-50/50 p-2 rounded-md';
      default:
        return 'border-l-2 border-l-gray-300 bg-gray-50/50 p-2 rounded-md';
    }
  };

  return (
    <li className={getContainerClass()}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">{item.name}</span>
            {item.quantity > 1 && (
              <span className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full">
                x{item.quantity}
              </span>
            )}
          </div>
          
          {item.notes && (
            <div className="flex items-center mt-1 gap-1 bg-amber-200 text-amber-800 px-2 py-1 rounded border border-amber-400">
              <AlertCircle size={14} className="text-amber-700 flex-shrink-0" />
              <p className="text-xs font-bold">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default OrderItemDisplay;
