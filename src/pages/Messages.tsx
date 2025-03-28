
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, UserCircle, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  receiver_name?: string;
}

interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch messages and profiles when component mounts
  useEffect(() => {
    console.log("Loading messages and profiles");
    fetchMessages();
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
          fetchMessages();
        })
      .subscribe((status) => {
        console.log('Messages channel status:', status);
      });

    return () => {
      console.log("Cleaning up messages subscription");
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchMessages = async () => {
    if (!user?.id) {
      console.log("Cannot fetch messages: No user ID");
      return;
    }

    try {
      console.log("Fetching messages for user:", user.id);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error fetching messages",
          description: error.message,
        });
        return;
      }

      console.log("Fetched messages:", data);
      
      // Enrich messages with profile names
      if (data && profiles.length > 0) {
        const enrichedMessages = await enrichMessagesWithNames(data);
        setMessages(enrichedMessages);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error("Exception fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const enrichMessagesWithNames = async (messages: Message[]) => {
    return messages.map(message => {
      const sender = profiles.find(p => p.id === message.sender_id);
      const receiver = profiles.find(p => p.id === message.receiver_id);
      
      return {
        ...message,
        sender_name: sender?.name || 'Unknown User',
        receiver_name: receiver?.name || 'Unknown User'
      };
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id) {
      console.log("Cannot send empty message or no selected chat");
      return;
    }

    try {
      console.log(`Sending message to ${selectedChat}: ${newMessage}`);
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedChat,
          content: newMessage,
          read: false
        })
        .select();

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error sending message",
          description: error.message,
        });
        return;
      }

      console.log("Message sent successfully:", data);
      setNewMessage('');
      fetchMessages();
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error("Exception sending message:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      console.log(`Marking message ${messageId} as read`);
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) {
        console.error("Error marking message as read:", error);
        return;
      }

      // Update local messages state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error("Exception marking message as read:", error);
    }
  };

  // Get unique conversation partners
  const getConversations = () => {
    const conversations = new Map<string, { id: string, name: string, lastMessage: string, unread: number }>();
    
    messages.forEach(msg => {
      const isIncoming = msg.receiver_id === user?.id;
      const partnerId = isIncoming ? msg.sender_id : msg.receiver_id;
      const partnerName = isIncoming ? msg.sender_name : msg.receiver_name;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          id: partnerId,
          name: partnerName || "Unknown User",
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
  };

  // Filter messages for selected conversation
  const getConversationMessages = () => {
    if (!selectedChat) return [];
    
    return messages
      .filter(msg => 
        (msg.sender_id === user?.id && msg.receiver_id === selectedChat) ||
        (msg.receiver_id === user?.id && msg.sender_id === selectedChat)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const selectConversation = (userId: string, userName: string) => {
    setSelectedChat(userId);
    setSelectedChatName(userName);
    
    // Mark unread messages from this user as read
    messages
      .filter(msg => msg.sender_id === userId && msg.receiver_id === user?.id && !msg.read)
      .forEach(msg => markAsRead(msg.id));
  };

  // Get unread message count
  const getUnreadCount = () => {
    return messages.filter(msg => msg.receiver_id === user?.id && !msg.read).length;
  };

  const conversations = getConversations();
  const conversationMessages = getConversationMessages();
  const unreadCount = getUnreadCount();

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
          <Card className="md:col-span-1">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-md">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[65vh] overflow-y-auto">
                {conversations.length > 0 ? (
                  conversations.map((convo) => (
                    <div
                      key={convo.id}
                      onClick={() => selectConversation(convo.id, convo.name)}
                      className={cn(
                        "p-3 border-b border-border cursor-pointer hover:bg-muted transition-colors",
                        selectedChat === convo.id && "bg-muted",
                        convo.unread > 0 && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-10 w-10 text-primary/40" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className={cn("font-medium", convo.unread > 0 && "font-semibold")}>
                              {convo.name}
                            </p>
                            {convo.unread > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {convo.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Messages will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="md:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-6 w-6 text-primary/40" />
                    <CardTitle className="text-md">{selectedChatName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[55vh] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages.length > 0 ? (
                      conversationMessages.map((msg) => {
                        const isSentByMe = msg.sender_id === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              isSentByMe ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg px-4 py-2",
                                isSentByMe
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-40" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t p-3 mt-auto">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[65vh] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm max-w-md mx-auto mt-1">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
