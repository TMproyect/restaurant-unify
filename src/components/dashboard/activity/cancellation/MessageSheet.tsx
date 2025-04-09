
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import RecipientSelector from './RecipientSelector';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { useMessages } from '@/hooks/use-messages';

interface MessageSheetProps {
  order: ActivityMonitorItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessageSheet: React.FC<MessageSheetProps> = ({
  order,
  isOpen,
  onOpenChange
}) => {
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('kitchen');
  const { sendMessage } = useMessages();

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        // Enviar mensaje usando el hook de mensajes que guarda en Supabase
        const sentMessage = await sendMessage(
          message,
          selectedRecipient,
          { 
            orderId: order.id,
            type: 'cancellation'
          }
        );
        
        if (sentMessage) {
          const getRecipientName = () => {
            switch (selectedRecipient) {
              case 'kitchen': return 'cocina';
              case 'manager': return 'gerencia';
              case 'delivery': return 'equipo de delivery';
              case 'store': return 'tienda';
              case 'all': return 'todas las áreas';
              default: return 'destinatario';
            }
          };
          
          toast.success(`Mensaje enviado a ${getRecipientName()} para la orden cancelada ${order.id.substring(0, 6)}`);
          setMessage('');
          onOpenChange(false);
        } else {
          toast.error("Error al enviar el mensaje");
        }
      } catch (error) {
        console.error("Error enviando mensaje:", error);
        toast.error("Error al enviar el mensaje");
      }
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
