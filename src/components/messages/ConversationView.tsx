
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, UserCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Message } from '@/services/messageService';

interface ConversationViewProps {
  selectedChat: string | null;
  selectedChatName: string;
  conversationMessages: Message[];
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
  currentUserId?: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  selectedChat,
  selectedChatName,
  conversationMessages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  currentUserId
}) => {
  if (!selectedChat) {
    return (
      <EmptyConversationState />
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary/40" />
          <CardTitle className="text-md">{selectedChatName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[55vh] flex flex-col">
        <MessageList 
          messages={conversationMessages} 
          currentUserId={currentUserId}
        />
        <MessageInput 
          value={newMessage} 
          onChange={onNewMessageChange} 
          onSend={onSendMessage} 
        />
      </CardContent>
    </Card>
  );
};

const MessageList: React.FC<{
  messages: Message[];
  currentUserId?: string;
}> = ({ messages, currentUserId }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length > 0 ? (
        messages.map((msg) => {
          const isSentByMe = msg.sender_id === currentUserId;
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
  );
};

const MessageInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}> = ({ value, onChange, onSend }) => {
  return (
    <div className="border-t p-3 mt-auto">
      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          className="flex-1"
        />
        <Button onClick={onSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const EmptyConversationState: React.FC = () => {
  return (
    <div className="h-[65vh] flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm max-w-md mx-auto mt-1">
          Choose a conversation from the list to view messages
        </p>
      </div>
    </div>
  );
};

export default ConversationView;
