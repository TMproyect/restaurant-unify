
import React, { useState, useEffect } from 'react';
import { RestaurantTable, TableZone, TableStatus, TableStatusLabels, TableStatusColors } from '@/types/tables';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateRestaurantTable } from '@/services/tableService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, TableIcon, Utensils, ClipboardList, Receipt, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getOrdersByTableId } from '@/services/orderService';

interface TableMapProps {
  tables: RestaurantTable[];
  zones: TableZone[];
  isLoading: boolean;
  onTableUpdate?: () => void;
  userRole?: string;
  onCreateOrder?: () => void;
}

export const TableMap: React.FC<TableMapProps> = ({ 
  tables, 
  zones, 
  isLoading, 
  onTableUpdate,
  userRole,
  onCreateOrder
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [tableActionsOpen, setTableActionsOpen] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [notification, setNotification] = useState<{ isVisible: boolean; message: string; table: number | null }>({
    isVisible: false,
    message: '',
    table: null
  });
  
  // Define permisos basados en rol
  const canManageTables = userRole === 'admin' || userRole === 'gerente' || userRole === 'propietario' || userRole === 'mesero';
  const canCreateOrders = userRole === 'admin' || userRole === 'gerente' || userRole === 'propietario' || userRole === 'mesero';
  const canViewOrders = userRole === 'admin' || userRole === 'gerente' || userRole === 'propietario' || userRole === 'mesero';
  
  console.log('🔍 [TableMap] User permissions:', { 
    role: userRole, 
    canManageTables, 
    canCreateOrders,
    canViewOrders
  });
  
  const filteredTables = selectedZone === 'all'
    ? tables
    : tables.filter(table => table.zone === selectedZone);

  // Función para manejar el clic en una mesa
  const handleTableClick = async (table: RestaurantTable) => {
    setSelectedTable(table);
    
    if (table.status === 'available' && canCreateOrders && onCreateOrder) {
      // Si la mesa está disponible y el usuario puede crear órdenes, ir directamente a crear orden
      onCreateOrder();
    } else if (canViewOrders) {
      // En otros casos, mostrar acciones disponibles para la mesa
      setTableActionsOpen(true);
      
      // Cargar órdenes existentes para esta mesa si tiene estado ocupado
      if (table.status === 'occupied') {
        loadTableOrders(table.id);
      }
    }
  };
  
  // Cargar órdenes para una mesa específica
  const loadTableOrders = async (tableId: string) => {
    try {
      setLoadingOrders(true);
      console.log('🔍 [TableMap] Loading orders for table:', tableId);
      
      // TODO: Implementar getOrdersByTableId en orderService
      const orders = await getOrdersByTableId(tableId);
      console.log('✅ [TableMap] Orders loaded:', orders);
      setTableOrders(orders || []);
    } catch (error) {
      console.error('❌ [TableMap] Error loading table orders:', error);
      toast.error('Error al cargar las órdenes de esta mesa');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Función para cambiar el estado de una mesa
  const changeTableStatus = async (tableId: string, newStatus: TableStatus) => {
    if (!canManageTables) {
      toast.error('No tienes permisos para cambiar el estado de las mesas');
      return;
    }
    
    try {
      const tableToUpdate = tables.find(t => t.id === tableId);
      if (!tableToUpdate) return;
      
      await updateRestaurantTable(
        tableId, 
        { status: newStatus }
      );
      
      // Mostrar notificación
      setNotification({
        isVisible: true,
        message: `Mesa ${tableToUpdate.number} actualizada a ${TableStatusLabels[newStatus]}`,
        table: tableToUpdate.number
      });
      
      // Disparar callback de actualización si existe
      if (onTableUpdate) {
        onTableUpdate();
      }
      
      // Cerrar el diálogo
      setStatusSelectOpen(false);
      setTableActionsOpen(false);
      setSelectedTable(null);
      
      // Esconder la notificación después de 3 segundos
      setTimeout(() => {
        setNotification({
          isVisible: false,
          message: '',
          table: null
        });
      }, 3000);
    } catch (error) {
      toast.error('Error al actualizar estado: ' + (error as Error).message);
      setStatusSelectOpen(false);
      setTableActionsOpen(false);
      setSelectedTable(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mapa de Mesas</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Filtrar por zona:</span>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las zonas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las zonas</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.name}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm mb-2">Estado de mesas:</div>
        <div className="flex flex-wrap gap-3">
          <Badge className={TableStatusColors.available}>Disponible</Badge>
          <Badge className={TableStatusColors.occupied}>Ocupada</Badge>
          <Badge className={TableStatusColors.reserved}>Reservada</Badge>
          <Badge className={TableStatusColors.maintenance}>Mantenimiento</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No hay mesas para mostrar en esta zona.
            </div>
          ) : (
            filteredTables.map(table => (
              <Card 
                key={table.id} 
                className="cursor-pointer hover:shadow-md transition-shadow relative"
                onClick={() => handleTableClick(table)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xl font-bold">Mesa {table.number}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        Zona: {table.zone}
                      </div>
                      <div className="text-sm text-gray-500">
                        Capacidad: {table.capacity} personas
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${TableStatusColors[table.status as TableStatus]}`} />
                  </div>
                  <div className="mt-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        table.status === 'available' 
                          ? 'border-green-500 text-green-700' 
                          : table.status === 'occupied' 
                            ? 'border-red-500 text-red-700' 
                            : table.status === 'reserved' 
                              ? 'border-blue-500 text-blue-700' 
                              : 'border-orange-500 text-orange-700'
                      }`}
                    >
                      {TableStatusLabels[table.status as TableStatus]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        Haga clic en una mesa para ver opciones
      </div>

      {/* Diálogo para acciones específicas de la mesa */}
      <Sheet 
        open={tableActionsOpen} 
        onOpenChange={setTableActionsOpen}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedTable && `Mesa ${selectedTable.number} - ${TableStatusLabels[selectedTable.status as TableStatus]}`}
            </SheetTitle>
          </SheetHeader>

          <div className="py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione una acción para esta mesa:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Botones específicos basados en el estado de la mesa y permisos */}
              {selectedTable?.status === 'available' && canCreateOrders && onCreateOrder && (
                <Button 
                  className="p-3 h-auto flex items-center justify-between"
                  onClick={() => {
                    setTableActionsOpen(false);
                    onCreateOrder();
                  }}
                >
                  <span className="flex items-center">
                    <Utensils className="h-5 w-5 mr-2" />
                    <span className="text-lg">Crear Orden</span>
                  </span>
                  <div className="h-6 w-6 flex items-center justify-center">→</div>
                </Button>
              )}
              
              {selectedTable?.status === 'occupied' && canViewOrders && (
                <Button 
                  variant="outline"
                  className="p-3 h-auto flex items-center justify-between"
                  onClick={() => {
                    // Aquí se implementaría la navegación a la vista de la orden
                    toast.info('Esta función se implementará en futuras versiones');
                    // setTableActionsOpen(false);
                  }}
                >
                  <span className="flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2" />
                    <span className="text-lg">Ver Orden Actual</span>
                  </span>
                  <div className="h-6 w-6 flex items-center justify-center">→</div>
                </Button>
              )}
              
              {selectedTable?.status === 'occupied' && canViewOrders && (
                <Button 
                  variant="outline"
                  className="p-3 h-auto flex items-center justify-between"
                  onClick={() => {
                    // Aquí se implementaría la generación de la precuenta
                    toast.info('Esta función se implementará en futuras versiones');
                    // setTableActionsOpen(false);
                  }}
                >
                  <span className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    <span className="text-lg">Generar Precuenta</span>
                  </span>
                  <div className="h-6 w-6 flex items-center justify-center">→</div>
                </Button>
              )}
              
              {canManageTables && (
                <Button 
                  variant="secondary"
                  className="p-3 h-auto flex items-center justify-between"
                  onClick={() => {
                    setTableActionsOpen(false);
                    setStatusSelectOpen(true);
                  }}
                >
                  <span className="flex items-center">
                    <TableIcon className="h-5 w-5 mr-2" />
                    <span className="text-lg">Cambiar Estado</span>
                  </span>
                  <div className="h-6 w-6 flex items-center justify-center">→</div>
                </Button>
              )}
              
              {/* Si la mesa está ocupada, mostrar órdenes activas */}
              {selectedTable?.status === 'occupied' && canViewOrders && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-medium mb-2">Órdenes Activas</h3>
                  {loadingOrders ? (
                    <div className="flex justify-center my-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : tableOrders.length > 0 ? (
                    <div className="space-y-2">
                      {tableOrders.map(order => (
                        <div key={order.id} className="p-2 bg-secondary/30 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">#{order.id.substring(0, 6)}</span>
                            <span className="text-sm">{new Date(order.created_at).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-sm">Cliente: {order.customer_name}</div>
                          <div className="text-sm">Items: {order.items_count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay órdenes activas para esta mesa.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo para seleccionar estado de mesa */}
      <Sheet 
        open={statusSelectOpen} 
        onOpenChange={setStatusSelectOpen}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedTable && `Cambiar estado de Mesa ${selectedTable.number}`}
            </SheetTitle>
          </SheetHeader>

          <div className="py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione el nuevo estado para la mesa:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                className={`p-3 h-auto flex items-center justify-between ${TableStatusColors.available} hover:bg-green-600`}
                onClick={() => selectedTable && changeTableStatus(selectedTable.id, 'available')}
              >
                <span className="text-lg font-semibold">Disponible</span>
                <div className="h-4 w-4 bg-white rounded-full"></div>
              </Button>
              
              <Button 
                className={`p-3 h-auto flex items-center justify-between ${TableStatusColors.occupied} hover:bg-red-600`}
                onClick={() => selectedTable && changeTableStatus(selectedTable.id, 'occupied')}
              >
                <span className="text-lg font-semibold">Ocupada</span>
                <div className="h-4 w-4 bg-white rounded-full"></div>
              </Button>
              
              <Button 
                className={`p-3 h-auto flex items-center justify-between ${TableStatusColors.reserved} hover:bg-blue-600`}
                onClick={() => selectedTable && changeTableStatus(selectedTable.id, 'reserved')}
              >
                <span className="text-lg font-semibold">Reservada</span>
                <div className="h-4 w-4 bg-white rounded-full"></div>
              </Button>
              
              <Button 
                className={`p-3 h-auto flex items-center justify-between ${TableStatusColors.maintenance} hover:bg-orange-600`}
                onClick={() => selectedTable && changeTableStatus(selectedTable.id, 'maintenance')}
              >
                <span className="text-lg font-semibold">Mantenimiento</span>
                <div className="h-4 w-4 bg-white rounded-full"></div>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notificación de estado actualizado */}
      {notification.isVisible && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center animate-in slide-in-from-right-5">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};
