
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, MessageSquare, User } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';
import { CancellationReasonDisplay } from './index';
import { MessageSheet } from './index';
import { Card } from "@/components/ui/card";

interface CancellationReviewDialogProps {
  order: ActivityMonitorItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const CancellationReviewDialog: React.FC<CancellationReviewDialogProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const [isMessageSheetOpen, setIsMessageSheetOpen] = useState(false);
  
  if (!order) return null;

  // Check if the customer has valid data
  const hasCustomerData = order.customer && 
    order.customer !== 'Unknown' && 
    order.customer !== 'N/A';
  
  const handleApproveAction = () => {
    toast.success(`Cancelación aprobada para la orden ${order.id.substring(0, 6)}`);
    onClose();
  };
  
  const handleRejectAction = () => {
    toast.error(`Cancelación rechazada para la orden ${order.id.substring(0, 6)}`);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Revisar Cancelación #{order.id.substring(0, 6)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <CancellationReasonDisplay 
              order={order}
              hasCustomerData={hasCustomerData}
            />
            
            {/* Customer Information Card (if available) */}
            {hasCustomerData && (
              <Card className="p-4 bg-slate-50">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium">Información del Cliente</h3>
                </div>
                <p className="text-sm">{order.customer}</p>
                {order.customerPhone && (
                  <p className="text-sm mt-1">Teléfono: {order.customerPhone}</p>
                )}
                {order.customerEmail && (
                  <p className="text-sm mt-1">Email: {order.customerEmail}</p>
                )}
                {order.customerAddress && (
                  <p className="text-sm mt-1">Dirección: {order.customerAddress}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  No se puede contactar al cliente por esta plataforma
                </p>
              </Card>
            )}
            
            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsMessageSheetOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar Equipo
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRejectAction}
                >
                  Rechazar Cancelación
                </Button>
                <Button 
                  variant="success"
                  onClick={handleApproveAction}
                >
                  Aprobar Cancelación
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Message Sheet with Recipient Selection */}
      <MessageSheet
        order={order}
        isOpen={isMessageSheetOpen}
        onOpenChange={setIsMessageSheetOpen}
      />
    </>
  );
};

export default CancellationReviewDialog;
