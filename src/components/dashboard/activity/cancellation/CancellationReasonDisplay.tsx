
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { User, Clock } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface CancellationReasonDisplayProps {
  order: ActivityMonitorItem;
  hasCustomerData: boolean;
}

const CancellationReasonDisplay: React.FC<CancellationReasonDisplayProps> = ({ 
  order, 
  hasCustomerData 
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-sm text-red-700">
          Esta orden ha sido cancelada y requiere revisión.
        </p>
      </div>
      
      {/* Customer and Time Information */}
      <div className="flex justify-between items-center">
        {hasCustomerData && (
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              <span>Cliente</span>
            </div>
            <div className="font-medium">{order.customer}</div>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Cancelada</span>
          </div>
          <div className="font-medium">
            {new Date(order.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Cancellation Details */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Razón de cancelación</h3>
        <div className="p-3 bg-gray-50 rounded-md text-sm">
          No disponible (necesita integración con sistema de cancelaciones)
        </div>
      </div>
    </div>
  );
};

export default CancellationReasonDisplay;
