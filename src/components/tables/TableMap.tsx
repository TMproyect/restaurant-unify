
import React, { useState } from 'react';
import { RestaurantTable, TableZone } from '@/types/tables';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateRestaurantTable } from '@/services/tableService';

interface TableMapProps {
  tables: RestaurantTable[];
  zones: TableZone[];
  isLoading: boolean;
}

export const TableMap: React.FC<TableMapProps> = ({ tables, zones, isLoading }) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  
  const filteredTables = selectedZone === 'all'
    ? tables
    : tables.filter(table => table.zone === selectedZone);

  const handleTableClick = async (table: RestaurantTable) => {
    const newStatus = getNextStatus(table.status);
    try {
      await updateRestaurantTable(table.id, { ...table, status: newStatus });
      toast.success(`Mesa ${table.number} actualizada a ${getStatusLabel(newStatus)}`);
    } catch (error) {
      toast.error('Error al actualizar estado: ' + (error as Error).message);
    }
  };

  const getNextStatus = (currentStatus: string): string => {
    const statusCycle = ['available', 'occupied', 'reserved', 'maintenance'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    return statusCycle[(currentIndex + 1) % statusCycle.length];
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'maintenance': return 'Mantenimiento';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-blue-500';
      case 'maintenance': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
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
          <Badge className="bg-green-500">Disponible</Badge>
          <Badge className="bg-red-500">Ocupada</Badge>
          <Badge className="bg-blue-500">Reservada</Badge>
          <Badge className="bg-orange-500">Mantenimiento</Badge>
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
                className="cursor-pointer hover:shadow-md transition-shadow"
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
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(table.status)}`} />
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className={`text-xs ${table.status === 'available' ? 'border-green-500 text-green-700' : table.status === 'occupied' ? 'border-red-500 text-red-700' : table.status === 'reserved' ? 'border-blue-500 text-blue-700' : 'border-orange-500 text-orange-700'}`}>
                      {getStatusLabel(table.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        Haga clic en una mesa para cambiar su estado
      </div>
    </div>
  );
};
