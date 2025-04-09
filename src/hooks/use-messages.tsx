
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Message, getMessages, sendMessage, markMessageAsRead, getUnreadMessagesCount } from '@/services/messageService';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MessageRecipient {
  id: string;
  name: string;
  role: string;
}

interface UseMessagesProps {
  orderId?: string;
}

export function useMessages(props?: UseMessagesProps) {
  const { orderId } = props || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientOptions, setRecipientOptions] = useState<MessageRecipient[]>([]);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Cargar mensajes
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedMessages = await getMessages();
      
      // Filtrar mensajes por orderId si se proporciona
      const filteredMessages = orderId 
        ? fetchedMessages.filter(msg => {
            try {
              // Verificar si el contenido del mensaje contiene el orderId
              const content = JSON.parse(msg.content);
              return content.orderId === orderId;
            } catch (e) {
              return false;
            }
          })
        : fetchedMessages;
        
      setMessages(filteredMessages);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      uiToast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, uiToast]);

  // Cargar destinatarios disponibles (áreas)
  const loadRecipients = useCallback(async () => {
    try {
      // Obtener perfiles disponibles para destinatarios
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role');
        
      if (error) throw error;
      
      // Agregamos áreas predefinidas además de los usuarios
      const areas = [
        { id: 'kitchen', name: 'Cocina', role: 'area' },
        { id: 'delivery', name: 'Delivery', role: 'area' },
        { id: 'customer', name: 'Cliente', role: 'area' },
        { id: 'store', name: 'Tienda', role: 'area' },
        { id: 'all', name: 'Todos', role: 'area' }
      ];
      
      setRecipientOptions([...areas, ...(data || [])]);
      
    } catch (error) {
      console.error("Error cargando destinatarios:", error);
    }
  }, []);
  
  // Enviar un mensaje
  const sendMessageToRecipient = useCallback(async (
    content: string, 
    recipientId: string,
    metadata?: { orderId?: string, type?: string }
  ) => {
    if (!user?.id) {
      toast.error("Debe iniciar sesión para enviar mensajes");
      return null;
    }
    
    try {
      // Formato del contenido del mensaje con metadatos
      const messageContent = JSON.stringify({
        text: content,
        orderId: metadata?.orderId || orderId,
        type: metadata?.type || 'general',
        timestamp: new Date().toISOString()
      });
      
      const sentMessage = await sendMessage({
        sender_id: user.id,
        receiver_id: recipientId,
        content: messageContent,
      });
      
      if (sentMessage) {
        toast.success("Mensaje enviado correctamente");
        
        // Refrescar mensajes
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        loadMessages();
        
        return sentMessage;
      }
      
      return null;
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error("Error al enviar el mensaje");
      return null;
    }
  }, [user?.id, orderId, queryClient, loadMessages]);
  
  // Marcar un mensaje como leído
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const updatedMessage = await markMessageAsRead(messageId);
      
      if (updatedMessage) {
        // Refrescar mensajes
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        loadMessages();
      }
      
      return updatedMessage;
    } catch (error) {
      console.error("Error marcando mensaje como leído:", error);
      return null;
    }
  }, [queryClient, loadMessages]);
  
  // Obtener mensajes no leídos
  const getUnreadCount = useCallback(async () => {
    if (!user?.id) return 0;
    
    try {
      return await getUnreadMessagesCount(user.id);
    } catch (error) {
      console.error("Error obteniendo conteo de mensajes no leídos:", error);
      return 0;
    }
  }, [user?.id]);
  
  // Configurar suscripción a nuevos mensajes
  useEffect(() => {
    loadMessages();
    loadRecipients();
    
    // Suscribirse a cambios en mensajes
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          console.log('Cambio en mensajes:', payload);
          loadMessages();
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages, loadRecipients]);
  
  return {
    messages,
    loading,
    recipientOptions,
    sendMessage: sendMessageToRecipient,
    markAsRead,
    getUnreadCount,
    refresh: loadMessages
  };
}
