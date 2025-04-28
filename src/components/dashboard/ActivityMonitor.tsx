
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Clock, AlertCircle, DollarSign, ChefHat, Archive } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ActivityMonitorProps } from './activity/types';
import { filterItems, calculateItemsCount } from './activity/utils/filterUtils';
import ActivityHeader from './activity/ActivityHeader';
import ActivityTabs from './activity/ActivityTabs';
import ActivityContent from './activity/ActivityContent';
import DateRangeFilter from './activity/DateRangeFilter';
import ActivityPagination from './activity/ActivityPagination';

const ITEMS_PER_PAGE = 50; // Límite de 50 elementos por página

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  items, 
  isLoading, 
  onActionClick 
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [itemsCount, setItemsCount] = useState<Record<string, number>>({
    all: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    exceptions: 0
  });
  
  // Añadir estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  const filters = [
    { id: 'delayed', label: 'Órdenes con Retraso', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'cancelled', label: 'Cancelaciones', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: 'discounts', label: 'Con Descuentos', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { id: 'kitchen', label: 'Cocina', icon: <ChefHat className="h-4 w-4 mr-2" /> },
    { id: 'archivable', label: 'Por Archivar', icon: <Archive className="h-4 w-4 mr-2" /> }
  ];
  
  // Update counts whenever items or date range change
  useEffect(() => {
    if (items && items.length > 0) {
      const counts = calculateItemsCount(items, dateRange);
      setItemsCount(counts);
      console.log('📊 [ActivityMonitor] Item counts updated:', counts);
    }
  }, [items, dateRange]);
  
  // Filtrar los items según los criterios actuales
  const filteredItems = filterItems(items, activeTab, activeFilter, dateRange);
  
  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  
  // Resetear a página 1 cuando cambie el filtrado
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeFilter, dateRange]);
  
  // Aplicar paginación a los items filtrados
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );
  
  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll al inicio de la tabla
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
    console.log('📊 [ActivityMonitor] Date range changed:', range);
    setDateRange(range);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <ActivityHeader 
            activeFilter={activeFilter} 
            setActiveFilter={setActiveFilter} 
            filters={filters}
          />
          <div className="flex justify-end">
            <DateRangeFilter onRangeChange={handleDateRangeChange} />
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <ActivityTabs itemsCount={itemsCount} />
        </div>
        
        <TabsContent value={activeTab}>
          <ActivityContent 
            isLoading={isLoading}
            items={items}
            filteredItems={paginatedItems}
            onActionClick={onActionClick}
            activeFilter={activeFilter}
          />
          
          {/* Componente de paginación */}
          {filteredItems.length > ITEMS_PER_PAGE && (
            <div className="px-6 py-4">
              <ActivityPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityMonitor;
