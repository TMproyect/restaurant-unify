
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Message } from '@/services/messageService';
import { Profile } from '@/components/messages/types';

interface UseConversationsProps {
  messages: Message[];
  profiles: Profile[];
}

export const useConversations = ({ messages, profiles }: UseConversationsProps) => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>('');

  // Get unique conversation partners
  const getConversations = useCallback(() => {
    const conversations = new Map<string, { id: string, name: string, lastMessage: string, unread: number }>();
    
    messages.forEach(msg => {
      const isIncoming = msg.receiver_id === user?.id;
      const partnerId = isIncoming ? msg.sender_id : msg.receiver_id;
      
      // Find partner profile
      const partnerProfile = profiles.find(p => p.id === partnerId);
      const partnerName = partnerProfile?.name || "Unknown User";
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          id: partnerId,
          name: partnerName,
          lastMessage: msg.content,
          unread: isIncoming && !msg.read ? 1 : 0
        });
      } else {
        const existing = conversations.get(partnerId)!;
        if (isIncoming && !msg.read) {
          existing.unread += 1;
        }
      }
    });
    
    return Array.from(conversations.values());
  }, [messages, profiles, user?.id]);

  // Filter messages for selected conversation
  const getConversationMessages = useCallback(() => {
    if (!selectedChat) return [];
    
    return messages
      .filter(msg => 
        (msg.sender_id === user?.id && msg.receiver_id === selectedChat) ||
        (msg.receiver_id === user?.id && msg.sender_id === selectedChat)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [selectedChat, messages, user?.id]);

  // Get unread message count
  const getUnreadCount = useCallback(() => {
    return messages.filter(msg => msg.receiver_id === user?.id && !msg.read).length;
  }, [messages, user?.id]);

  const selectConversation = useCallback((userId: string, userName: string) => {
    setSelectedChat(userId);
    setSelectedChatName(userName);
  }, []);

  return {
    conversations: getConversations(),
    conversationMessages: getConversationMessages(),
    unreadCount: getUnreadCount(),
    selectedChat,
    selectedChatName,
    selectConversation
  };
};
