
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PencilIcon, Trash2Icon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TableZone } from '@/types/tables';
import { addTableZone, updateTableZone, deleteTableZone } from '@/services/tables';
import { ZoneForm } from './ZoneForm';

interface TableZonesProps {
  zones: TableZone[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const TableZones: React.FC<TableZonesProps> = ({ zones, isLoading, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<TableZone | null>(null);

  const handleAddZone = async (zoneData: Omit<TableZone, 'id' | 'created_at'>) => {
    try {
      await addTableZone(zoneData);
      toast.success('Zona agregada correctamente');
      setIsFormOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Error al agregar zona: ' + (error as Error).message);
    }
  };

  const handleEditZone = async (zoneData: Omit<TableZone, 'created_at'>) => {
    try {
      if (selectedZone?.id) {
        await updateTableZone(selectedZone.id, zoneData);
        toast.success('Zona actualizada correctamente');
        setIsFormOpen(false);
        onRefresh();
      }
    } catch (error) {
      toast.error('Error al actualizar zona: ' + (error as Error).message);
    }
  };

  const handleDeleteZone = async () => {
    try {
      if (selectedZone?.id) {
        await deleteTableZone(selectedZone.id);
        toast.success('Zona eliminada correctamente');
        setIsDeleteDialogOpen(false);
        onRefresh();
      }
    } catch (error) {
      toast.error('Error al eliminar zona: ' + (error as Error).message);
    }
  };

  const openAddForm = () => {
    setSelectedZone(null);
    setIsFormOpen(true);
  };

  const openEditForm = (zone: TableZone) => {
    setSelectedZone(zone);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (zone: TableZone) => {
    setSelectedZone(zone);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Zonas de Mesas</h2>
        <Button onClick={openAddForm}>Agregar Zona</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Zonas de mesas en el restaurante</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No hay zonas registradas. Haga clic en "Agregar Zona" para crear una.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium capitalize">{zone.name}</TableCell>
                  <TableCell>{zone.description || 'Sin descripción'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(zone)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(zone)}>
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
            <DialogTitle>{selectedZone ? 'Editar Zona' : 'Agregar Zona'}</DialogTitle>
          </DialogHeader>
          <ZoneForm 
            zone={selectedZone} 
            onSubmit={selectedZone ? handleEditZone : handleAddZone}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la zona "{selectedZone?.name}" 
              de la base de datos. Las mesas en esta zona podrían quedar sin una zona asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteZone}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
