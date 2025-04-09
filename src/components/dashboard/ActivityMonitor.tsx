
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, AlertCircle, DollarSign, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityMonitorProps } from './activity/types';
import FilterDropdown from './activity/FilterDropdown';
import ActivityTable from './activity/ActivityTable';
import ActivityLoading from './activity/ActivityLoading';
import ActivityEmptyState from './activity/ActivityEmptyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  items, 
  isLoading, 
  onRefresh, 
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
      const counts = {
        all: items.length,
        active: items.filter(item => 
          item.status === 'pending' || 
          item.status === 'preparing' || 
          item.status === 'ready' ||
          item.status === 'priority-pending' ||
          item.status === 'priority-preparing' ||
          item.status === 'pendiente' ||
          item.status === 'preparando' ||
          item.status === 'en preparación' ||
          item.status === 'listo'
        ).length,
        completed: items.filter(item => 
          item.status === 'delivered' || 
          item.status === 'completed' || 
          item.status === 'cancelled' ||
          item.status === 'entregado' ||
          item.status === 'completado' ||
          item.status === 'cancelado'
        ).length,
        exceptions: items.filter(item => 
          item.isDelayed || 
          item.hasCancellation || 
          (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
        ).length
      };
      
      setItemsCount(counts);
      console.log('📊 [ActivityMonitor] Item counts updated:', counts);
    }
  }, [items]);
  
  const filterItems = (items: ActivityMonitorProps['items']) => {
    if (!items || items.length === 0) {
      return [];
    }
    
    let filtered = [...items]; // Crear una copia del array para no afectar el original
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(item => 
        item.status === 'pending' || 
        item.status === 'preparing' || 
        item.status === 'ready' ||
        item.status === 'priority-pending' ||
        item.status === 'priority-preparing' ||
        item.status === 'pendiente' ||
        item.status === 'preparando' ||
        item.status === 'en preparación' ||
        item.status === 'listo'
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(item => 
        item.status === 'delivered' || 
        item.status === 'completed' || 
        item.status === 'cancelled' ||
        item.status === 'entregado' ||
        item.status === 'completado' ||
        item.status === 'cancelado'
      );
    } else if (activeTab === 'exceptions') {
      filtered = filtered.filter(item => 
        item.isDelayed || 
        item.hasCancellation || 
        (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15)
      );
    }
    
    // Apply additional filter if selected
    if (activeFilter === 'delayed') {
      filtered = filtered.filter(item => item.isDelayed);
    } else if (activeFilter === 'cancelled') {
      filtered = filtered.filter(item => item.hasCancellation);
    } else if (activeFilter === 'discounts') {
      filtered = filtered.filter(item => item.hasDiscount);
    } else if (activeFilter === 'kitchen') {
      filtered = filtered.filter(item => item.kitchenId && item.kitchenId !== '');
    }
    
    // Log para verificar la cantidad de items filtrados
    console.log(`📊 [ActivityMonitor] Items filtrados (${activeTab}/${activeFilter || 'sin filtro'}): ${filtered.length}`);
    
    return filtered;
  };
  
  const filteredItems = filterItems(items);
  
  const handleRefresh = () => {
    console.log('🔄 [ActivityMonitor] Refresh clicked');
    if (onRefresh) {
      onRefresh();
    }
  };
  
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
            
            <Button variant="ghost" size="sm" className="h-8" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="relative">
              Todos
              {itemsCount.all > 0 && (
                <span className="ml-1 text-xs bg-gray-200 text-gray-800 rounded-full px-1.5">
                  {itemsCount.all}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="relative">
              Activos
              {itemsCount.active > 0 && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5">
                  {itemsCount.active}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Completados
              {itemsCount.completed > 0 && (
                <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-1.5">
                  {itemsCount.completed}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="relative">
              Excepciones
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute right-1">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[250px] text-xs">
                      Muestra órdenes que:
                      <br />- Están retrasadas (más de 15 minutos)
                      <br />- Han sido canceladas
                      <br />- Tienen descuentos significativos (≥15%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {itemsCount.exceptions > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 rounded-full px-1.5">
                  {itemsCount.exceptions}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab}>
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
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityMonitor;
