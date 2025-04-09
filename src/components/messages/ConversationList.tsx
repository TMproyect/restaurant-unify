
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/services/messageService';

interface ConversationListProps {
  conversations: Array<{ id: string, name: string, lastMessage: string, unread: number }>;
  selectedChat: string | null;
  onSelectConversation: (userId: string, userName: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedChat,
  onSelectConversation
}) => {
  return (
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
                onClick={() => onSelectConversation(convo.id, convo.name)}
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
  );
};

export default ConversationList;
