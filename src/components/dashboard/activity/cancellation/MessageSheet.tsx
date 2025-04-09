
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import RecipientSelector from './RecipientSelector';
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface MessageSheetProps {
  order: ActivityMonitorItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasCustomerData: boolean;
}

const MessageSheet: React.FC<MessageSheetProps> = ({
  order,
  isOpen,
  onOpenChange,
  hasCustomerData
}) => {
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>(
    hasCustomerData ? 'customer' : 'kitchen'
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      const getRecipientName = () => {
        switch (selectedRecipient) {
          case 'customer': return 'cliente';
          case 'kitchen': return 'cocina';
          case 'manager': return 'gerencia';
          case 'delivery': return 'equipo de delivery';
          default: return 'destinatario';
        }
      };

      toast.success(`Mensaje enviado a ${getRecipientName()} para la orden cancelada ${order.id.substring(0, 6)}`);
      setMessage('');
      onOpenChange(false);
    } else {
      toast.error("Por favor ingrese un mensaje");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Contactar</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enviar mensaje sobre la cancelación de la orden #{order.id.substring(0, 6)}
          </p>
          
          {/* Recipient Selection */}
          <RecipientSelector
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            hasCustomerData={hasCustomerData}
          />
          
          <Textarea
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Escriba su mensaje aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendMessage}>
              Enviar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MessageSheet;
