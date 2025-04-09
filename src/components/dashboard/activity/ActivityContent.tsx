
import React from 'react';
import { CardContent } from '@/components/ui/card';
import ActivityLoading from './ActivityLoading';
import ActivityEmptyState from './ActivityEmptyState';
import ActivityTable from './ActivityTable';
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface ActivityContentProps {
  isLoading: boolean;
  items: ActivityMonitorItem[];
  filteredItems: ActivityMonitorItem[];
  onActionClick?: (action: string) => void;
}

const ActivityContent: React.FC<ActivityContentProps> = ({
  isLoading,
  items,
  filteredItems,
  onActionClick
}) => {
  return (
    <CardContent>
      {isLoading ? (
        <ActivityLoading />
      ) : !items || items.length === 0 ? (
        <ActivityEmptyState />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No hay órdenes que coincidan con el filtro seleccionado
        </div>
      ) : (
        <ActivityTable 
          filteredItems={filteredItems} 
          onActionClick={onActionClick} 
        />
      )}
    </CardContent>
  );
};

export default ActivityContent;
