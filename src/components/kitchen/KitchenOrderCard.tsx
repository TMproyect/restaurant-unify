import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActionButton from './ActionButton';
import OrderItemDisplay from './OrderItemDisplay';
import OrderTimer from './OrderTimer';
import OrderSourceBadge from './OrderSourceBadge';
import { OrderItem } from './kitchenTypes';
import { NormalizedOrderStatus, getStatusLabel } from '@/utils/orderStatusUtils';
import { Calendar, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
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
  // Determine if the order is urgent based on timer calculations
  const createdDate = new Date(order.createdAt);
  const minutesPassed = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60));
  const isUrgent = minutesPassed >= urgencyThreshold;
  const isWarning = minutesPassed >= urgencyThreshold * 0.75 && minutesPassed < urgencyThreshold;

  // Determine card styling based on status and urgency
  const getCardStyles = () => {
    // Urgent style takes precedence
    if (orderStatus === 'pending' && isUrgent) {
      return 'border-l-4 border-l-red-500 bg-red-50';
    }
    
    // Warning state
    if (orderStatus === 'pending' && isWarning) {
      return 'border-l-4 border-l-yellow-500 bg-yellow-50';
    }

    // Otherwise, use status-based styling
    switch (orderStatus) {
      case 'pending':
        return 'border-l-4 border-l-amber-400 bg-white';
      case 'preparing':
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      case 'ready':
        return 'border-l-4 border-l-green-500 bg-green-50';
      default:
        return 'border-l-4 border-l-gray-300 bg-white';
    }
  };

  // Add urgent animation class if needed
  const urgentClass = isUrgent && orderStatus === 'pending' ? 'shadow-md' : '';

  return (
    <Card className={`hover:shadow-sm transition-shadow ${getCardStyles()} ${urgentClass}`}>
      <CardHeader className="p-3 pb-2 space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-1">
            <span className="font-bold">#{order.id.substring(0, 4)}</span>
            <span className="text-sm font-normal">
              Mesa {order.table}
            </span>
            <OrderSourceBadge source={order.orderSource} />
          </CardTitle>
          <OrderTimer 
            createdAt={order.createdAt} 
            urgencyThresholdMinutes={urgencyThreshold}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs flex items-center">
            <Calendar size={12} className="mr-1" />
            <span className="font-medium">{order.customerName}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="xs" className="h-6 w-6 p-0">
                  <Info size={14} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detalles del Pedido #{order.id.substring(0, 6)}</DialogTitle>
                </DialogHeader>
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
              </DialogContent>
            </Dialog>
            
            <p className="text-xs px-1 py-0.5 bg-secondary/50 rounded-md">
              {kitchenName}
            </p>
            
            {hasManagePermission && (
              <ActionButton 
                orderStatus={orderStatus}
                hasManagePermission={hasManagePermission}
                orderId={order.id}
                updateOrderStatus={updateOrderStatus}
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        <ul className="space-y-1.5">
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
