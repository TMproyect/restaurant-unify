
import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { OrderItem } from './kitchenTypes';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface OrderItemDisplayProps {
  item: OrderItem;
  orderStatus: NormalizedOrderStatus;
}

const OrderItemDisplay: React.FC<OrderItemDisplayProps> = ({ item, orderStatus }) => {
  // Determinar los estilos y el icono según el estado
  const getStyles = () => {
    switch (orderStatus) {
      case 'pending':
        return {
          container: 'p-3 rounded bg-yellow-50 border border-yellow-200',
          icon: <Clock size={14} className="text-yellow-500" />,
          status: 'Pendiente'
        };
      case 'preparing':
        return {
          container: 'p-3 rounded bg-blue-50 border border-blue-200',
          icon: <Clock size={14} className="text-blue-500 animate-pulse" />,
          status: 'Preparando'
        };
      case 'ready':
        return {
          container: 'p-3 rounded bg-green-50 border border-green-200',
          icon: <CheckCircle size={14} className="text-green-600" />,
          status: 'Listo'
        };
      default:
        return {
          container: 'p-3 rounded bg-gray-50 border border-gray-200',
          icon: <Clock size={14} className="text-gray-500" />,
          status: 'Procesando'
        };
    }
  };

  const styles = getStyles();

  return (
    <li className={styles.container}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <div className="flex items-center">
            {styles.icon}
            <p className="font-medium ml-1">
              {item.name} {item.quantity > 1 && (
                <span className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full text-xs ml-1">
                  x{item.quantity}
                </span>
              )}
            </p>
          </div>
          {item.notes && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded-full">
              <AlertCircle size={12} />
              <p>{item.notes}</p>
            </div>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          orderStatus === 'preparing' ? 'bg-blue-100 text-blue-800' :
          orderStatus === 'ready' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {styles.status}
        </span>
      </div>
    </li>
  );
};

export default OrderItemDisplay;
