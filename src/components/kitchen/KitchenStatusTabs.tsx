
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface KitchenStatusTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  pendingCount?: number;
  preparingCount?: number;
  completedCount?: number;
  cancelledCount?: number;
}

const KitchenStatusTabs: React.FC<KitchenStatusTabsProps> = ({
  children,
  defaultValue = "pending",
  onValueChange,
  pendingCount = 0,
  preparingCount = 0,
  completedCount = 0,
  cancelledCount = 0
}) => {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      onValueChange={onValueChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger 
          value="pending" 
          className={cn(
            "transition-all duration-300 ease-in-out",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          Pendientes <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2">{pendingCount}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="preparing" 
          className={cn(
            "transition-all duration-300 ease-in-out",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          En preparación <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2">{preparingCount}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ready" 
          className={cn(
            "transition-all duration-300 ease-in-out",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          Completados <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2">{completedCount}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="cancelled" 
          className={cn(
            "transition-all duration-300 ease-in-out",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          Cancelados <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2">{cancelledCount}</span>
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};

export default KitchenStatusTabs;
