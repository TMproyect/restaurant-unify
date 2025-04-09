
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, User, AlertCircle, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';

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
  const [isMessageSheetOpen, setIsMessageSheetOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  
  if (!order) return null;

  const handleSendMessage = () => {
    if (message.trim()) {
      toast.success(`Mensaje enviado para la orden cancelada ${order.id.substring(0, 6)}`);
      setMessage('');
      setIsMessageSheetOpen(false);
    } else {
      toast.error("Por favor ingrese un mensaje");
    }
  };
  
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
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">
                Esta orden ha sido cancelada y requiere revisión.
              </p>
            </div>
            
            {/* Customer Information */}
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
            
            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsMessageSheetOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar Cliente
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
      
      {/* Message Sheet */}
      <Sheet open={isMessageSheetOpen} onOpenChange={setIsMessageSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Contactar Cliente</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviar mensaje al cliente sobre la cancelación de la orden #{order.id.substring(0, 6)}
            </p>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Escriba su mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMessageSheetOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendMessage}>
                Enviar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CancellationReviewDialog;
