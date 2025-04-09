
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChefHat, Check } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  notes: string;
  quantity: number;
}

interface KitchenOrderCardProps {
  order: {
    id: string;
    table: string;
    customerName: string;
    time: string;
    kitchenId: string;
    status: string;
    items: OrderItem[];
  };
  kitchenName: string;
  orderStatus: 'pending' | 'preparing' | 'ready';
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  kitchenName,
  orderStatus,
  hasManagePermission,
  updateOrderStatus
}) => {
  // Determinar la clase de borde basada en el estado
  const getBorderClass = () => {
    switch (orderStatus) {
      case 'pending':
        return 'border-l-4 border-l-yellow-500';
      case 'preparing':
        return 'border-l-4 border-l-blue-500';
      case 'ready':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  // Botón de acción basado en el estado
  const getActionButton = () => {
    if (!hasManagePermission) return null;
    
    if (orderStatus === 'pending') {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7"
          onClick={() => updateOrderStatus(order.id, 'preparing')}
        >
          <ChefHat size={14} className="mr-1" /> Preparar
        </Button>
      );
    } else if (orderStatus === 'preparing') {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7"
          onClick={() => updateOrderStatus(order.id, 'ready')}
        >
          <Check size={14} className="mr-1" /> Completado
        </Button>
      );
    }
    
    return null;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${getBorderClass()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Orden #{order.id.substring(0, 4)} - {order.table}</CardTitle>
          <span className="text-sm text-muted-foreground">{order.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
          <div className="flex gap-2">
            <p className="text-xs bg-secondary/50 px-2 py-1 rounded">
              {kitchenName}
            </p>
            {getActionButton()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li key={index} className="p-3 rounded bg-secondary/30">
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
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default KitchenOrderCard;
