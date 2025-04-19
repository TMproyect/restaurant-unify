
import React from 'react';
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { KitchenTabTrigger } from './KitchenTabTrigger';

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
        <KitchenTabTrigger value="pending" label="Pendientes" count={pendingCount} />
        <KitchenTabTrigger value="preparing" label="En preparación" count={preparingCount} />
        <KitchenTabTrigger value="ready" label="Completados" count={completedCount} />
        <KitchenTabTrigger value="cancelled" label="Cancelados" count={cancelledCount} />
      </TabsList>

      {children}
    </Tabs>
  );
};

export default KitchenStatusTabs;
