
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, MessageSquare } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';
import { CancellationReasonDisplay } from './index';
import { MessageSheet } from './index';

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
            
            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsMessageSheetOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
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
        hasCustomerData={hasCustomerData}
      />
    </>
  );
};

export default CancellationReviewDialog;
