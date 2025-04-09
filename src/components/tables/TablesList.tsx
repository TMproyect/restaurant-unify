import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PencilIcon, Trash2Icon } from 'lucide-react';
import { TableForm } from './TableForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TableZone, RestaurantTable } from '@/types/tables';
import { addRestaurantTable, updateRestaurantTable, deleteRestaurantTable } from '@/services/tables';

interface TablesListProps {
  tables: RestaurantTable[];
  isLoading: boolean;
  zones: TableZone[];
  onRefresh: () => void;
}

export const TablesList: React.FC<TablesListProps> = ({ tables, isLoading, zones, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const handleAddTable = async (tableData: Omit<RestaurantTable, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addRestaurantTable(tableData);
      toast.success('Mesa agregada correctamente');
      setIsFormOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Error al agregar mesa: ' + (error as Error).message);
    }
  };

  const handleEditTable = async (tableData: Omit<RestaurantTable, 'created_at' | 'updated_at'>) => {
    try {
      if (selectedTable?.id) {
        await updateRestaurantTable(selectedTable.id, tableData);
        toast.success('Mesa actualizada correctamente');
        setIsFormOpen(false);
        onRefresh();
      }
    } catch (error) {
      toast.error('Error al actualizar mesa: ' + (error as Error).message);
    }
  };

  const handleDeleteTable = async () => {
    try {
      if (selectedTable?.id) {
        await deleteRestaurantTable(selectedTable.id);
        toast.success('Mesa eliminada correctamente');
        setIsDeleteDialogOpen(false);
        onRefresh();
      }
    } catch (error) {
      toast.error('Error al eliminar mesa: ' + (error as Error).message);
    }
  };

  const openAddForm = () => {
    setSelectedTable(null);
    setIsFormOpen(true);
  };

  const openEditForm = (table: RestaurantTable) => {
    setSelectedTable(table);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (table: RestaurantTable) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const getZoneName = (zoneKey: string) => {
    const zone = zones.find(z => z.name === zoneKey);
    return zone ? zone.name : zoneKey;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mesas del Restaurante</h2>
        <Button onClick={openAddForm}>Agregar Mesa</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Lista de mesas del restaurante</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Número</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Zona</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay mesas registradas. Haga clic en "Agregar Mesa" para crear una.
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.number}</TableCell>
                  <TableCell>{table.capacity} personas</TableCell>
                  <TableCell>{getZoneName(table.zone)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(table.status)}`}>
                      {getStatusLabel(table.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(table)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(table)}>
                          <Trash2Icon className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTable ? 'Editar Mesa' : 'Agregar Mesa'}</DialogTitle>
          </DialogHeader>
          <TableForm 
            table={selectedTable} 
            zones={zones} 
            onSubmit={selectedTable ? handleEditTable : handleAddTable}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la mesa {selectedTable?.number} 
              de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteTable}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
