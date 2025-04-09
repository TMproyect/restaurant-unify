
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import MessageForm from './MessageForm';

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
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Enviar Mensaje</SheetTitle>
        </SheetHeader>
        <MessageForm 
          order={order}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MessageSheet;
