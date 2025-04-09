
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface ExceptionsDisplayProps {
  order: ActivityMonitorItem;
}

const ExceptionsDisplay: React.FC<ExceptionsDisplayProps> = ({ order }) => {
  if (!(order.isDelayed || order.hasCancellation || order.hasDiscount)) {
    return null;
  }
  
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Excepciones</h3>
        <div className="flex flex-wrap gap-2">
          {order.isDelayed && (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
              <Clock className="h-3 w-3 text-yellow-700 mr-1" />
              <span className="text-xs text-yellow-700">
                Retrasado ({order.timeElapsed}m)
              </span>
            </Badge>
          )}
          
          {order.hasCancellation && (
            <Badge variant="outline" className="bg-red-50 border-red-200">
              <span className="text-xs text-red-700">
                Cancelado
              </span>
            </Badge>
          )}
          
          {order.hasDiscount && (
            <Badge variant="outline" className="bg-blue-50 border-blue-200">
              <DollarSign className="h-3 w-3 text-blue-700 mr-1" />
              <span className="text-xs text-blue-700">
                Descuento ({order.discountPercentage}%)
              </span>
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default ExceptionsDisplay;
