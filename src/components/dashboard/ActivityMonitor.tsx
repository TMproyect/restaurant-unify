import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Clock, AlertCircle, DollarSign, ChefHat, Archive, Info, Loader2 } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ActivityMonitorProps } from './activity/types';
import { filterItems, calculateItemsCount } from './activity/utils/filterUtils';
import ActivityHeader from './activity/ActivityHeader';
import ActivityTabs from './activity/ActivityTabs';
import ActivityContent from './activity/ActivityContent';
import DateRangeFilter from './activity/DateRangeFilter';
import ActivityPagination from './activity/ActivityPagination';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);
  const [lastArchiveRun, setLastArchiveRun] = useState<string | null>(null);
  const [archivingInProgress, setArchivingInProgress] = useState(false);
  
  const filters = [
    { id: 'delayed', label: 'Órdenes con Retraso', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'cancelled', label: 'Cancelaciones', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: 'discounts', label: 'Con Descuentos', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { id: 'kitchen', label: 'Cocina', icon: <ChefHat className="h-4 w-4 mr-2" /> },
    { id: 'archivable', label: 'Por Archivar', icon: <Archive className="h-4 w-4 mr-2" /> }
  ];
  
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
  }, []);
  
  useEffect(() => {
    if (items && items.length > 0) {
      const counts = calculateItemsCount(items, dateRange);
      setItemsCount(counts);
      console.log('📊 [ActivityMonitor] Item counts updated:', counts);
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
    console.log('📊 [ActivityMonitor] Date range changed:', range);
    setDateRange(range);
  };
  
  const handleManualArchive = async () => {
    try {
      setArchivingInProgress(true);
      toast.info('Iniciando proceso de archivado...');
      
      const { data, error } = await supabase.functions.invoke('archive-old-orders');
      
      if (error) {
        console.error('❌ [ActivityMonitor] Error archiving orders:', error);
        toast.error(`Error al archivar: ${error.message}`);
        return;
      }
      
      if (data.processed > 0) {
        const now = new Date().toISOString();
        await supabase
          .from('system_settings')
          .upsert({ key: 'last_archive_run', value: now });
        
        setLastArchiveRun(now);
        toast.success(`Se archivaron ${data.processed} órdenes antiguas correctamente`);
        
        if (onActionClick) {
          onActionClick('refresh-data');
        }
      } else {
        toast.info('No hay órdenes para archivar en este momento');
      }
    } catch (error) {
      console.error('❌ [ActivityMonitor] Error in manual archive:', error);
      toast.error('Error al archivar órdenes');
    } finally {
      setArchivingInProgress(false);
    }
  };
  
  const getLastArchiveText = () => {
    if (!lastArchiveRun) return 'Nunca';
    
    try {
      const date = new Date(lastArchiveRun);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha desconocida';
    }
  };
  
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
              
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>Último archivado: {getLastArchiveText()}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">
                      {autoArchiveEnabled 
                        ? 'El archivado automático está habilitado. Las órdenes antiguas se archivarán automáticamente.' 
                        : 'El archivado automático está deshabilitado. Puede archivar órdenes manualmente.'}
                    </p>
                    <p className="text-xs mt-1">
                      Configurar en: Ajustes &gt; Archivado
                    </p>
                  </TooltipContent>
                </Tooltip>
                
                <Badge
                  variant="outline" 
                  className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={handleManualArchive}
                >
                  {archivingInProgress ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Archivando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Archive className="h-3 w-3" />
                      Archivar ({itemsCount.archivable})
                    </span>
                  )}
                </Badge>
              </div>
            </div>
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
