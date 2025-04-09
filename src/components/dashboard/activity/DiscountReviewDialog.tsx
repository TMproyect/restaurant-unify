
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, DollarSign, AlertCircle } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';

interface DiscountReviewDialogProps {
  order: ActivityMonitorItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const DiscountReviewDialog: React.FC<DiscountReviewDialogProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!order) return null;

  const handleApproveDiscount = () => {
    toast.success(`Descuento aprobado para la orden ${order.id.substring(0, 6)}`);
    onClose();
  };

  const handleRevokeDiscount = () => {
    toast.error(`Descuento revocado para la orden ${order.id.substring(0, 6)}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-600">
            <DollarSign className="h-5 w-5 mr-2" />
            Revisión de Descuento #{order.id.substring(0, 6)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              Esta orden tiene un descuento de <strong>{order.discountPercentage}%</strong> aplicado.
            </p>
          </div>
          
          {/* Customer and Discount Information */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                <span>Cliente</span>
              </div>
              <div className="font-medium">{order.customer}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Descuento</span>
              </div>
              <div className="font-medium text-blue-600">
                {order.discountPercentage}%
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Discount Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Precio original</div>
              <div className="font-medium">
                ${(order.total / (1 - order.discountPercentage! / 100)).toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Precio con descuento</div>
              <div className="font-medium">${order.total.toFixed(2)}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Ahorro</div>
              <div className="font-medium text-green-600">
                ${(order.total / (1 - order.discountPercentage! / 100) - order.total).toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Aplicado por</div>
              <div className="font-medium">
                {order.appliedBy || "Sistema"}
              </div>
            </div>
          </div>
          
          {/* Warning if high discount */}
          {order.discountPercentage && order.discountPercentage > 20 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Este descuento es mayor al 20% y requiere aprobación de administrador.
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleRevokeDiscount}
            >
              Revocar Descuento
            </Button>
            <Button
              variant="success"
              onClick={handleApproveDiscount}
            >
              Aprobar Descuento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountReviewDialog;
