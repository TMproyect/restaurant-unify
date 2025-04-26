
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Zap } from 'lucide-react';
import OrderTimer from '../OrderTimer';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import OrderSourceBadge from '../OrderSourceBadge';

interface OrderHeaderProps {
  id: string;
  table: string;
  customerName: string;
  createdAt: string;
  orderStatus: NormalizedOrderStatus;
  urgencyThreshold: number;
  kitchenName: string;
  orderSource: 'delivery' | 'qr_table' | 'pos' | null;
  isPrioritized: boolean;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  id,
  table,
  customerName,
  createdAt,
  orderStatus,
  urgencyThreshold,
  kitchenName,
  orderSource,
  isPrioritized,
}) => {
  return (
    <div className="p-3 pb-2 space-y-1">
      <div className="flex justify-between items-center">
        <div className="text-base flex items-center gap-1">
          <span className="font-bold">#{id.substring(0, 4)}</span>
          <span className="text-sm font-normal">
            Mesa {table}
          </span>
          {isPrioritized && (
            <Badge className="ml-1 bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center">
              <Zap size={12} className="mr-1" />
              <span className="text-xs">Priorizado</span>
            </Badge>
          )}
        </div>
        <OrderTimer 
          createdAt={createdAt} 
          urgencyThresholdMinutes={urgencyThreshold}
          orderStatus={orderStatus}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs flex items-center">
          <Calendar size={12} className="mr-1" />
          <span className="font-medium">{customerName}</span>
        </p>
        
        <div className="flex items-center gap-2">
          <OrderSourceBadge source={orderSource} />
          <p className="text-xs px-1 py-0.5 bg-secondary/50 rounded-md">
            {kitchenName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderHeader;
