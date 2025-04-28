
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Clock, AlertCircle, DollarSign, ChefHat, Archive } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ActivityMonitorProps } from './activity/types';
import { filterItems, calculateItemsCount } from './activity/utils/filterUtils';
import ActivityHeader from './activity/ActivityHeader';
import ActivityTabs from './activity/ActivityTabs';
import ActivityContent from './activity/ActivityContent';
import { useArchive } from '@/hooks/dashboard/use-archive';
import ArchiveInfo from './activity/ArchiveInfo';
import DateFilterSection from './activity/DateFilterSection';
import ActivityPagination from './activity/ActivityPagination';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 50;

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
    exceptions: 0,
    archivable: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    archivingInProgress,
    lastArchiveRun,
    autoArchiveEnabled,
    handleManualArchive,
    setLastArchiveRun,
    setAutoArchiveEnabled
  } = useArchive(onActionClick ? () => onActionClick('refresh-data') : undefined);

  useEffect(() => {
    const fetchArchiveSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['auto_archive_enabled', 'last_archive_run']);
        
        if (error) throw error;
        
        if (data) {
          const autoArchiveEnabledSetting = data.find(item => item.key === 'auto_archive_enabled');
          const lastArchiveRunSetting = data.find(item => item.key === 'last_archive_run');
          
          if (autoArchiveEnabledSetting) {
            setAutoArchiveEnabled(autoArchiveEnabledSetting.value === 'true');
          }
          
          if (lastArchiveRunSetting) {
            setLastArchiveRun(lastArchiveRunSetting.value);
          }
        }
      } catch (error) {
        console.error('Error al cargar configuración de archivado:', error);
      }
    };
    
    fetchArchiveSettings();
  }, [setAutoArchiveEnabled, setLastArchiveRun]);
  
  useEffect(() => {
    if (items && items.length > 0) {
      const counts = calculateItemsCount(items, dateRange);
      setItemsCount(counts);
    }
  }, [items, dateRange]);
  
  const filteredItems = filterItems(items, activeTab, activeFilter, dateRange);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeFilter, dateRange]);
  
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
    setDateRange(range);
  };

  const filters = [
    { id: 'delayed', label: 'Órdenes con Retraso', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'cancelled', label: 'Cancelaciones', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: 'discounts', label: 'Con Descuentos', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { id: 'kitchen', label: 'Cocina', icon: <ChefHat className="h-4 w-4 mr-2" /> },
    { id: 'archivable', label: 'Por Archivar', icon: <Archive className="h-4 w-4 mr-2" /> }
  ];
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <ActivityHeader 
                activeFilter={activeFilter} 
                setActiveFilter={setActiveFilter} 
                filters={filters}
              />
              
              <ArchiveInfo
                lastArchiveRun={lastArchiveRun}
                autoArchiveEnabled={autoArchiveEnabled}
                archivingInProgress={archivingInProgress}
                archivableCount={itemsCount.archivable}
                onArchiveClick={handleManualArchive}
              />
            </div>
            <DateFilterSection onRangeChange={handleDateRangeChange} />
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
    </TooltipProvider>
  );
};

export default ActivityMonitor;
