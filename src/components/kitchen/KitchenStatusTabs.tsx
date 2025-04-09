
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define allowed status values for tabs
type KitchenTabStatus = 'pending' | 'preparing' | 'ready' | 'cancelled';

interface KitchenStatusTabsProps {
  defaultValue: KitchenTabStatus;
  onValueChange: (value: KitchenTabStatus) => void;
  pendingCount: number;
  preparingCount: number;
  completedCount: number;
  cancelledCount: number;
  children: React.ReactNode;
}

const KitchenStatusTabs: React.FC<KitchenStatusTabsProps> = ({
  defaultValue,
  onValueChange,
  pendingCount,
  preparingCount,
  completedCount,
  cancelledCount,
  children
}) => {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      className="w-full"
      onValueChange={(value) => onValueChange(value as KitchenTabStatus)}
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pending" className="relative">
          Pendientes
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="preparing" className="relative">
          En preparación
          {preparingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {preparingCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="ready" className="relative">
          Completados
          {completedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {completedCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="relative">
          Cancelados
          {cancelledCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cancelledCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default KitchenStatusTabs;
