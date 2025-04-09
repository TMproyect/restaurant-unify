
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
  activeFilter?: string | null;
}

const ActivityContent: React.FC<ActivityContentProps> = ({
  isLoading,
  items,
  filteredItems,
  onActionClick,
  activeFilter = null
}) => {
  console.log('🔄 [ActivityContent] Rendering:', { 
    isLoading, 
    itemsCount: items?.length || 0, 
    filteredCount: filteredItems?.length || 0 
  });
  
  // Force min-height to prevent layout shifts during loading
  return (
    <CardContent className="min-h-[400px]">
      {isLoading ? (
        <ActivityLoading />
      ) : !items || items.length === 0 ? (
        <ActivityEmptyState filter={activeFilter} />
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
