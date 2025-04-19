
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface KitchenTabTriggerProps {
  value: string;
  label: string;
  count?: number;
}

export const KitchenTabTrigger: React.FC<KitchenTabTriggerProps> = ({
  value,
  label,
  count = 0
}) => {
  return (
    <TabsTrigger 
      value={value} 
      className={cn(
        "transition-all duration-300 ease-in-out",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      )}
    >
      {label} <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2">{count}</span>
    </TabsTrigger>
  );
};
