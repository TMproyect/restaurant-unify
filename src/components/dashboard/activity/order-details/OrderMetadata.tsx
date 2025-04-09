
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Clock, Package, DollarSign } from "lucide-react";
import StatusBadge from '../StatusBadge';
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface OrderMetadataProps {
  order: ActivityMonitorItem;
}

const OrderMetadata: React.FC<OrderMetadataProps> = ({ order }) => {
  return (
    <div className="space-y-4">
      {/* Customer and Status Information */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-1" />
            <span>Cliente</span>
          </div>
          <div className="font-medium">{order.customer}</div>
        </div>
        
        <StatusBadge status={order.status} />
      </div>
      
      <Separator />
      
      {/* Order Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Hora de Pedido</span>
          </div>
          <div className="font-medium">
            {new Date(order.timestamp).toLocaleTimeString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(order.timestamp).toLocaleDateString()}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Package className="h-4 w-4 mr-1" />
            <span>Productos</span>
          </div>
          <div className="font-medium">{order.itemsCount} items</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>Total</span>
          </div>
          <div className="font-medium">${order.total.toFixed(2)}</div>
        </div>
        
        {order.hasDiscount && (
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>Descuento</span>
            </div>
            <div className="font-medium text-blue-600">
              {order.discountPercentage}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderMetadata;
