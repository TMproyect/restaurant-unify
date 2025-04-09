
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { 
  CustomerInfoCard,
  ExceptionsDisplay,
  MessageSheet,
  OrderMetadata 
} from './order-details';

interface OrderDetailsDialogProps {
  order: ActivityMonitorItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const [isMessageSheetOpen, setIsMessageSheetOpen] = useState(false);

  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden #{order.id.substring(0, 6)}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <OrderMetadata order={order} />
            
            <ExceptionsDisplay order={order} />
            
            <CustomerInfoCard order={order} />
            
            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsMessageSheetOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
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

export default OrderDetailsDialog;
