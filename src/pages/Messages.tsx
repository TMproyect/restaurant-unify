
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message, getMessages, sendMessage, markMessageAsRead } from '@/services/messageService';
import { useQueryClient } from '@tanstack/react-query';
import ConversationList from '@/components/messages/ConversationList';
import ConversationView from '@/components/messages/ConversationView';
import { useConversations } from '@/components/messages/hooks/useConversations';
import { Profile } from '@/components/messages/types';

const Messages = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use our custom hook for conversation management
  const {
    conversations,
    conversationMessages,
    unreadCount,
    selectedChat,
    selectedChatName,
    selectConversation
  } = useConversations({ messages, profiles });

  // Fetch profiles when component mounts
  useEffect(() => {
    console.log("Loading profiles");
    fetchProfiles();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          console.log('New message event:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          fetchMessages();
        })
      .subscribe((status) => {
        console.log('Messages channel status:', status);
      });

    return () => {
      console.log("Cleaning up messages subscription");
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, [user?.id]);

  const fetchProfiles = async () => {
    try {
      console.log("Fetching user profiles");
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error fetching profiles",
          description: error.message,
        });
        return;
      }

      console.log("Fetched profiles:", data);
      setProfiles(data || []);
    } catch (error) {
      console.error("Exception fetching profiles:", error);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const messagesData = await getMessages();
      console.log("Fetched messages:", messagesData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error fetching messages",
        description: "Could not load messages",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id) {
      console.log("Cannot send empty message or no selected chat");
      return;
    }

    try {
      console.log(`Sending message to ${selectedChat}: ${newMessage}`);
      const sentMessage = await sendMessage({
        sender_id: user.id,
        receiver_id: selectedChat,
        content: newMessage,
      });

      if (sentMessage) {
        console.log("Message sent successfully:", sentMessage);
        setNewMessage('');
        fetchMessages();
        
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        });
      }
    } catch (error) {
      console.error("Exception sending message:", error);
    }
  };

  const handleConversationSelect = (userId: string, userName: string) => {
    selectConversation(userId, userName);
    
    // Mark unread messages from this user as read
    messages
      .filter(msg => msg.sender_id === userId && msg.receiver_id === user?.id && !msg.read)
      .forEach(msg => markAsReadAndRefresh(msg.id));
  };

  const markAsReadAndRefresh = async (messageId: string) => {
    try {
      console.log(`Marking message ${messageId} as read`);
      await markMessageAsRead(messageId);
      fetchMessages();
    } catch (error) {
      console.error("Exception marking message as read:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread messages
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Conversations List */}
          <ConversationList 
            conversations={conversations}
            selectedChat={selectedChat}
            onSelectConversation={handleConversationSelect}
          />

          {/* Messages */}
          <ConversationView 
            selectedChat={selectedChat}
            selectedChatName={selectedChatName}
            conversationMessages={conversationMessages}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
