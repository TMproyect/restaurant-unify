
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  User, 
  AlertCircle, 
  MessageSquare,
  ChefHat,
  Truck,
  Store,
  Users
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CancellationReviewDialogProps {
  order: ActivityMonitorItem | null;
  isOpen: boolean;
  onClose: () => void;
}

type RecipientOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
};

const CancellationReviewDialog: React.FC<CancellationReviewDialogProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const [isMessageSheetOpen, setIsMessageSheetOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('customer');
  
  if (!order) return null;

  // Verificar si el cliente tiene datos válidos
  const hasCustomerData = order.customer && order.customer !== 'Unknown' && order.customer !== 'N/A';

  const recipientOptions: RecipientOption[] = [
    ...(hasCustomerData ? [{
      id: 'customer',
      name: 'Cliente',
      icon: <User className="h-4 w-4 text-green-500" />,
      description: `Enviar mensaje a ${order.customer}`
    }] : []),
    {
      id: 'kitchen',
      name: 'Cocina',
      icon: <ChefHat className="h-4 w-4 text-orange-500" />,
      description: 'Notificar al personal de cocina'
    },
    {
      id: 'manager',
      name: 'Gerencia',
      icon: <Users className="h-4 w-4 text-purple-500" />,
      description: 'Informar a gerencia sobre la cancelación'
    },
    {
      id: 'delivery',
      name: 'Delivery',
      icon: <Truck className="h-4 w-4 text-blue-500" />,
      description: 'Notificar al equipo de delivery'
    }
  ];

  // Si no hay datos del cliente, seleccionar la primera opción por defecto
  React.useEffect(() => {
    if (!hasCustomerData && recipientOptions.length > 0) {
      setSelectedRecipient(recipientOptions[0].id);
    }
  }, [order.id]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const recipient = recipientOptions.find(r => r.id === selectedRecipient);
      toast.success(`Mensaje enviado a ${recipient?.name || 'destinatario'} para la orden cancelada ${order.id.substring(0, 6)}`);
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
            
            {/* Customer Information - Solo mostrar si hay datos */}
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
      <Sheet open={isMessageSheetOpen} onOpenChange={setIsMessageSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Contactar</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviar mensaje sobre la cancelación de la orden #{order.id.substring(0, 6)}
            </p>
            
            {/* Recipient Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Seleccionar destinatario</h3>
              <RadioGroup
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
                className="space-y-2"
              >
                {recipientOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
                    <RadioGroupItem value={option.id} id={`recipient-${option.id}`} />
                    <Label htmlFor={`recipient-${option.id}`} className="flex flex-1 items-center cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {option.icon}
                        <span className="font-medium">{option.name}</span>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{option.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Textarea
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Escriba su mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            
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
