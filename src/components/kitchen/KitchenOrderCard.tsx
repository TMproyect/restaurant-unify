import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
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

  return (
    <>
      <Card 
        className={`hover:shadow-md transition-shadow ${getCardStyles()} ${urgentClass} cursor-pointer`}
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
              {/* Order Source Badge - Made more prominent */}
              <OrderSourceBadge source={order.orderSource} />
              
              <p className="text-xs px-1 py-0.5 bg-secondary/50 rounded-md">
                {kitchenName}
              </p>
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
          
          {/* Action button moved here to be more prominent */}
          {hasManagePermission && (
            <ActionButton 
              orderStatus={orderStatus}
              hasManagePermission={hasManagePermission}
              orderId={order.id}
              updateOrderStatus={updateOrderStatus}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
            
            {/* Add action buttons to the dialog for easy access */}
            {hasManagePermission && orderStatus !== 'ready' && orderStatus !== 'cancelled' && (
              <div className="flex gap-2 justify-end mt-4 pt-2 border-t">
                {orderStatus === 'pending' && (
                  <Button 
                    variant="warning" 
                    onClick={() => {
                      updateOrderStatus(order.id, 'preparing');
                      setIsDialogOpen(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <ChefHat size={18} />
                    <span>Iniciar Preparación</span>
                  </Button>
                )}
                
                {orderStatus === 'preparing' && (
                  <Button 
                    variant="success" 
                    onClick={() => {
                      updateOrderStatus(order.id, 'ready');
                      setIsDialogOpen(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle size={18} />
                    <span>Marcar como Listo</span>
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    updateOrderStatus(order.id, 'cancelled');
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <XCircle size={18} />
                  <span>Cancelar Pedido</span>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KitchenOrderCard;
