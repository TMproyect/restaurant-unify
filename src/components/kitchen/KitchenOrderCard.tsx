
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import ActionButton from './ActionButton';
import OrderItemDisplay from './OrderItemDisplay';
import OrderDetails from './OrderDetails';
import OrderStatusActions from './OrderStatusActions';
import { OrderItem } from './types';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import OrderHeader from './components/OrderHeader';
import OrderCardContainer from './components/OrderCardContainer';

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
  
  const createdDate = new Date(order.createdAt);
  const now = new Date();
  const minutesElapsed = Math.floor((now.getTime() - createdDate.getTime()) / 1000) / 60;
  
  const isUrgent = minutesElapsed >= urgencyThreshold;
  const isPrioritized = order.status.toLowerCase().includes('priority-');

  const handleOpenDetails = () => {
    setIsDialogOpen(true);
  };

  const handleAction = async (newStatus: NormalizedOrderStatus): Promise<boolean> => {
    const result = await updateOrderStatus(order.id, newStatus);
    setIsDialogOpen(false);
    return result;
  };

  return (
    <>
      <OrderCardContainer
        orderStatus={orderStatus}
        isUrgent={isUrgent}
        isPrioritized={isPrioritized}
        onClick={handleOpenDetails}
      >
        <OrderHeader
          id={order.id}
          table={order.table}
          customerName={order.customerName}
          createdAt={order.createdAt}
          orderStatus={orderStatus}
          urgencyThreshold={urgencyThreshold}
          kitchenName={kitchenName}
          orderSource={order.orderSource}
          isPrioritized={isPrioritized}
        />
        
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
          
          {hasManagePermission && (
            <div className="mt-auto pt-2">
              <ActionButton 
                orderStatus={orderStatus}
                hasManagePermission={hasManagePermission}
                orderId={order.id}
                updateOrderStatus={updateOrderStatus}
                isPrioritized={isPrioritized}
              />
            </div>
          )}
        </CardContent>
      </OrderCardContainer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Detalles del Pedido #{order.id.substring(0, 6)}
              {isPrioritized && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Zap size={12} className="mr-1" />
                  Priorizado
                </Badge>
              )}
            </DialogTitle>
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
              isPrioritized={isPrioritized}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KitchenOrderCard;
