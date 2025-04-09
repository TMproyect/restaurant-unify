
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KitchenStatusTabsProps {
  defaultValue: string;
  onValueChange: (value: 'pending' | 'preparing' | 'ready') => void;
  pendingCount: number;
  preparingCount: number;
  completedCount: number;
  children: React.ReactNode;
}

const KitchenStatusTabs: React.FC<KitchenStatusTabsProps> = ({
  defaultValue,
  onValueChange,
  pendingCount,
  preparingCount,
  completedCount,
  children
}) => {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      className="w-full"
      onValueChange={(value) => onValueChange(value as 'pending' | 'preparing' | 'ready')}
    >
      <TabsList className="grid w-full grid-cols-3">
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
      </TabsList>
      {children}
    </Tabs>
  );
};

export default KitchenStatusTabs;
