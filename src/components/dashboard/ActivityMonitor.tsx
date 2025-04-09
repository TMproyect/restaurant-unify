
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityMonitorProps } from './activity/types';
import FilterDropdown from './activity/FilterDropdown';
import ActivityTable from './activity/ActivityTable';
import ActivityLoading from './activity/ActivityLoading';
import ActivityEmptyState from './activity/ActivityEmptyState';

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  items, 
  isLoading, 
  onRefresh, 
  onActionClick 
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const filters = [
    { id: 'delayed', label: 'Órdenes con Retraso', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'cancelled', label: 'Cancelaciones', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: 'discounts', label: 'Con Descuentos', icon: <DollarSign className="h-4 w-4 mr-2" /> }
  ];
  
  const filterItems = (items: ActivityMonitorProps['items']) => {
    let filtered = items;
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = items.filter(item => 
        item.status === 'pending' || 
        item.status === 'preparing' || 
        item.status === 'ready'
      );
    } else if (activeTab === 'completed') {
      filtered = items.filter(item => 
        item.status === 'delivered' || 
        item.status === 'completed' || 
        item.status === 'cancelled'
      );
    } else if (activeTab === 'exceptions') {
      filtered = items.filter(item => 
        item.isDelayed || 
        item.hasCancellation || 
        item.hasDiscount
      );
    }
    
    // Apply additional filter if selected
    if (activeFilter === 'delayed') {
      filtered = filtered.filter(item => item.isDelayed);
    } else if (activeFilter === 'cancelled') {
      filtered = filtered.filter(item => item.hasCancellation);
    } else if (activeFilter === 'discounts') {
      filtered = filtered.filter(item => item.hasDiscount);
    }
    
    return filtered;
  };
  
  const filteredItems = filterItems(items);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Monitor de Actividad</CardTitle>
          <div className="flex gap-2">
            <FilterDropdown 
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              filters={filters}
            />
            
            <Button variant="ghost" size="sm" className="h-8" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab}>
          <CardContent>
            {isLoading ? (
              <ActivityLoading />
            ) : filteredItems.length === 0 ? (
              <ActivityEmptyState />
            ) : (
              <ActivityTable 
                filteredItems={filteredItems} 
                onActionClick={onActionClick} 
              />
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityMonitor;
