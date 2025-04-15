
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import ActionButton from './ActionButton';
import OrderItemDisplay from './OrderItemDisplay';
import OrderTimer from './OrderTimer';
import OrderSourceBadge from './OrderSourceBadge';
import OrderDetails from './OrderDetails';
import OrderStatusActions from './OrderStatusActions';
import { OrderItem } from './types';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KitchenOrderCardProps {
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
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<boolean>;
  urgencyThreshold: number;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  kitchenName,
  orderStatus,
  hasManagePermission,
  updateOrderStatus,
  urgencyThreshold
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Determine if the order is urgent based on timer calculations
  const createdDate = new Date(order.createdAt);
  const now = new Date();
  const secondsElapsed = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  const minutesElapsed = secondsElapsed / 60;
  
  // Calculate urgency and warning thresholds
  const isUrgent = minutesElapsed >= urgencyThreshold;
  const isWarning = minutesElapsed >= (urgencyThreshold * 0.7) && minutesElapsed < urgencyThreshold;

  // Determine card styling based on status and urgency
  const getCardStyles = () => {
    // Urgent style takes precedence
    if (orderStatus === 'pending' && isUrgent) {
      return 'border-l-4 border-l-red-500 bg-red-50/80';
    }
    
    // Warning state
    if (orderStatus === 'pending' && isWarning) {
      return 'border-l-4 border-l-yellow-500 bg-yellow-50/80';
    }

    // Otherwise, use status-based styling
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

  // Add subtle shadow for urgent orders
  const urgentClass = isUrgent && orderStatus === 'pending' ? 'shadow-md' : '';
  
  // Abrir el diálogo con detalles
  const handleOpenDetails = () => {
    setIsDialogOpen(true);
  };

  // Handle dialog close and action 
  const handleAction = async (newStatus: NormalizedOrderStatus) => {
    await updateOrderStatus(order.id, newStatus);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card 
        className={`hover:shadow-md transition-shadow ${getCardStyles()} ${urgentClass} cursor-pointer flex flex-col h-full`}
        onClick={handleOpenDetails}
      >
        <CardHeader className="p-3 pb-2 space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-1">
              <span className="font-bold">#{order.id.substring(0, 4)}</span>
              <span className="text-sm font-normal">
                Mesa {order.table}
              </span>
            </CardTitle>
            <OrderTimer 
              createdAt={order.createdAt} 
              urgencyThresholdMinutes={urgencyThreshold}
              orderStatus={orderStatus}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs flex items-center">
              <Calendar size={12} className="mr-1" />
              <span className="font-medium">{order.customerName}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <OrderSourceBadge source={order.orderSource} />
              
              <p className="text-xs px-1 py-0.5 bg-secondary/50 rounded-md">
                {kitchenName}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0 flex-grow flex flex-col">
          <ul className="space-y-1.5">
            {order.items.map((item, index) => (
              <OrderItemDisplay 
                key={index} 
                item={item} 
                orderStatus={orderStatus} 
              />
            ))}
          </ul>
          
          {/* Action button now at the bottom with auto margin top */}
          {hasManagePermission && (
            <div className="mt-auto pt-2">
              <ActionButton 
                orderStatus={orderStatus}
                hasManagePermission={hasManagePermission}
                orderId={order.id}
                updateOrderStatus={updateOrderStatus}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{order.id.substring(0, 6)}</DialogTitle>
          </DialogHeader>
          <OrderDetails 
            order={order}
            kitchenName={kitchenName}
            orderStatus={orderStatus}
          />
          
          {hasManagePermission && orderStatus !== 'ready' && orderStatus !== 'cancelled' && (
            <OrderStatusActions 
              orderStatus={orderStatus}
              onAction={handleAction}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KitchenOrderCard;
