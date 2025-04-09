
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useMessages } from '@/hooks/use-messages';
import RecipientSelector from './RecipientSelector';
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface MessageFormProps {
  order: ActivityMonitorItem;
  onCancel: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ order, onCancel }) => {
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
            type: 'order-details'
          }
        );
        
        if (sentMessage) {
          const getRecipientName = () => {
            switch (selectedRecipient) {
              case 'kitchen': return 'cocina';
              case 'delivery': return 'equipo de delivery';
              case 'store': return 'tienda';
              case 'all': return 'todas las áreas';
              default: return 'destinatario';
            }
          };
          
          toast.success(`Mensaje enviado a ${getRecipientName()} para la orden ${order.id.substring(0, 6)}`);
          setMessage('');
          onCancel();
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
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        Enviar mensaje relacionado con la orden #{order.id.substring(0, 6)}
      </p>
      
      <RecipientSelector
        selectedRecipient={selectedRecipient}
        setSelectedRecipient={setSelectedRecipient}
      />
      
      <Textarea
        placeholder="Escriba su mensaje aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[120px]"
      />
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSendMessage}>
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default MessageForm;
