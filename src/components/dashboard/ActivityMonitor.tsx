
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Clock, AlertCircle, DollarSign, Info } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ActivityMonitorProps } from './activity/types';
import { filterItems, calculateItemsCount } from './activity/utils/filterUtils';
import ActivityHeader from './activity/ActivityHeader';
import ActivityTabs from './activity/ActivityTabs';
import ActivityContent from './activity/ActivityContent';

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  items, 
  isLoading, 
  onActionClick 
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [itemsCount, setItemsCount] = useState<Record<string, number>>({
    all: 0,
    active: 0,
    completed: 0,
    exceptions: 0
  });
  
  const filters = [
    { id: 'delayed', label: 'Órdenes con Retraso', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'cancelled', label: 'Cancelaciones', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: 'discounts', label: 'Con Descuentos', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { id: 'kitchen', label: 'Cocina', icon: <Info className="h-4 w-4 mr-2" /> }
  ];
  
  // Actualizar conteos cada vez que cambian los items
  useEffect(() => {
    if (items && items.length > 0) {
      const counts = calculateItemsCount(items);
      setItemsCount(counts);
      console.log('📊 [ActivityMonitor] Item counts updated:', counts);
    }
  }, [items]);
  
  const filteredItems = filterItems(items, activeTab, activeFilter);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <ActivityHeader 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
          filters={filters} 
        />
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <ActivityTabs itemsCount={itemsCount} />
        </div>
        
        <TabsContent value={activeTab}>
          <ActivityContent 
            isLoading={isLoading}
            items={items}
            filteredItems={filteredItems}
            onActionClick={onActionClick}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityMonitor;
