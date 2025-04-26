
import React from 'react';
import { Card } from '@/components/ui/card';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface OrderCardContainerProps {
  children: React.ReactNode;
  orderStatus: NormalizedOrderStatus;
  isUrgent: boolean;
  isPrioritized: boolean;
  onClick: () => void;
}

const OrderCardContainer: React.FC<OrderCardContainerProps> = ({
  children,
  orderStatus,
  isUrgent,
  isPrioritized,
  onClick,
}) => {
  const getCardStyles = () => {
    if (isPrioritized) {
      return 'border-l-4 border-l-yellow-500 bg-yellow-50/80';
    }
    
    if (orderStatus === 'pending' && isUrgent) {
      return 'border-l-4 border-l-red-500 bg-red-50/80';
    }
    
    switch (orderStatus) {
      case 'pending':
        return 'border-l-4 border-l-gray-300 bg-white';
      case 'preparing':
        return 'border-l-4 border-l-blue-500 bg-blue-50/80';
      case 'ready':
        return 'border-l-4 border-l-green-500 bg-green-50/80';
      case 'cancelled':
        return 'border-l-4 border-l-gray-400 bg-gray-100/80';
      default:
        return 'border-l-4 border-l-gray-300 bg-white';
    }
  };

  const urgentClass = (isUrgent && orderStatus === 'pending') || isPrioritized ? 'shadow-md' : '';

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${getCardStyles()} ${urgentClass} cursor-pointer flex flex-col h-full`}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};

export default OrderCardContainer;
