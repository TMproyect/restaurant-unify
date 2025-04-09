
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TableMap } from '@/components/tables/TableMap';
import { RestaurantTable, TableZone } from '@/types/tables';
import { getRestaurantTables, getTableZones, subscribeToTableChanges } from '@/services/tables';
import { getOrders, Order } from '@/services/orderService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersList from '@/components/dashboard/OrdersList';

interface WaiterTableViewProps {
  onCreateOrder: () => void;
  onRefresh: () => void;
  refreshKey: number;
}

const WaiterTableView: React.FC<WaiterTableViewProps> = ({ 
  onCreateOrder,
  onRefresh,
  refreshKey
}) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [zones, setZones] = useState<TableZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');
  const { user } = useAuth();
  
  // Lógica para cargar mesas y zonas
  useEffect(() => {
    console.log('🔄 [WaiterTableView] Loading tables and zones');
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        // Cargar zonas de mesas
        const zonesData = await getTableZones();
        console.log('✅ [WaiterTableView] Zones loaded:', zonesData.length);
        setZones(zonesData);
        
        // Cargar mesas
        const tablesData = await getRestaurantTables();
        console.log('✅ [WaiterTableView] Tables loaded:', tablesData.length);
        
        // TODO: En un sistema real, filtrar por mesas asignadas al mesero actual
        // Por ahora, mostramos todas las mesas
        setTables(tablesData);
      } catch (error) {
        console.error('❌ [WaiterTableView] Error loading data:', error);
        toast.error('Error al cargar las mesas y zonas');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Suscribirse a cambios en las mesas en tiempo real
    const unsubscribe = subscribeToTableChanges((updatedTables) => {
      console.log('🔄 [WaiterTableView] Realtime tables update received:', updatedTables.length);
      setTables(updatedTables);
    });
    
    return () => {
      unsubscribe();
    };
  }, [refreshKey]);
  
  // Manejar el clic en una mesa
  const handleTableUpdate = () => {
    console.log('🔄 [WaiterTableView] Table updated, refreshing data');
    onRefresh();
  };
  
  // Comprobamos si hay suficientes datos para mostrar
  const hasTablesData = tables.length > 0 && zones.length > 0;
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="tables" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="tables" className="relative">
            Mapa de Mesas
          </TabsTrigger>
          <TabsTrigger value="orders" className="relative">
            Mis Órdenes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tables" className="mt-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-[250px]" />
                  <Skeleton className="h-4 w-[300px]" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Skeleton key={i} className="h-32 w-full rounded-md" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : hasTablesData ? (
            <TableMap 
              tables={tables} 
              zones={zones} 
              isLoading={false} 
              onTableUpdate={handleTableUpdate}
              userRole={user?.role}
              onCreateOrder={onCreateOrder}
            />
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-64">
                <p className="text-lg font-medium">No hay mesas configuradas</p>
                <p className="text-sm text-muted-foreground">
                  Contacte al administrador para configurar las mesas del restaurante.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="orders" className="mt-0">
          <Card>
            <CardContent className="p-4">
              <OrdersList 
                key={refreshKey}
                limit={10} 
                onRefresh={onRefresh}
                // TODO: En un sistema real, filtrar por órdenes asignadas al mesero actual
                // filter="pending"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaiterTableView;
