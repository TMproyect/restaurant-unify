
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Printer, Plus, Trash, RefreshCw, Check, X, Info, HelpCircle } from 'lucide-react';
import usePrintService from '@/hooks/use-print-service';
import { PrinterStation } from '@/services/printing/types';
import printerStationService from '@/services/printing/stationService';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { TestPrintButton } from './TestPrintButton';

export const PrinterStationsConfig = () => {
  const { isConnected, availablePrinters } = usePrintService();
  const [stations, setStations] = useState<PrinterStation[]>([]);
  const [showNewStationDialog, setShowNewStationDialog] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationDescription, setNewStationDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load stations on component mount
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = () => {
    const loadedStations = printerStationService.getStations();
    setStations(loadedStations);
  };

  const handlePrinterSelect = (stationId: string, printerName: string | null) => {
    printerStationService.assignPrinter(stationId, printerName);
    loadStations(); // Reload stations to update UI
    toast.success('Impresora asignada correctamente');
  };

  const handleAddStation = () => {
    if (!newStationName.trim()) {
      toast.error('El nombre de la estación no puede estar vacío');
      return;
    }

    setIsSaving(true);
    
    try {
      printerStationService.addStation({
        name: newStationName.trim(),
        description: newStationDescription.trim() || undefined,
        printerName: null
      });
      
      toast.success('Estación añadida correctamente');
      loadStations();
      setShowNewStationDialog(false);
      setNewStationName('');
      setNewStationDescription('');
    } catch (error) {
      toast.error('Error al añadir la estación');
      console.error('Error adding station:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStation = (id: string) => {
    const result = printerStationService.deleteStation(id);
    if (result) {
      toast.success('Estación eliminada correctamente');
      loadStations();
    } else {
      toast.error('No se puede eliminar una estación predefinida');
    }
  };

  const isDefaultStation = (id: string) => {
    return ['cashier', 'kitchen', 'bar', 'general'].includes(id);
  };

  const getPrinterStatusBadge = (printerName: string | null) => {
    if (!printerName) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
          Sin asignar
        </Badge>
      );
    }
    
    const printerExists = availablePrinters.some(p => p.name === printerName);
    
    if (!isConnected) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
          Desconectado
        </Badge>
      );
    } else if (printerExists) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <Check className="h-3 w-3" /> Disponible
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
          <Info className="h-3 w-3" /> No encontrada
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Estaciones de Preparación e Impresión</CardTitle>
            <CardDescription>
              Configure las estaciones de preparación y asigne impresoras para cada una
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">Asigne impresoras a las diferentes estaciones de su negocio. 
                Cada tipo de documento (comandas, facturas, etc.) se enviará a la impresora asignada a su estación correspondiente.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800 mb-4">
            <p className="font-medium">Sistema de impresión no conectado</p>
            <p className="text-sm mt-1">
              Para configurar las impresoras, primero debe conectar el sistema de impresión QZ Tray.
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Estaciones configuradas</h3>
          <Button
            onClick={() => setShowNewStationDialog(true)}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Nueva estación
          </Button>
        </div>
        
        <div className="space-y-4">
          {stations.map(station => (
            <div 
              key={station.id} 
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{station.name}</h4>
                  {getPrinterStatusBadge(station.printerName)}
                </div>
                {station.description && (
                  <p className="text-sm text-muted-foreground">{station.description}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="min-w-[180px]">
                  <Select
                    value={station.printerName || 'none'}
                    onValueChange={(value) => handlePrinterSelect(station.id, value === 'none' ? null : value)}
                    disabled={!isConnected || availablePrinters.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar impresora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Sin asignar --</SelectItem>
                      {availablePrinters.map((printer) => (
                        <SelectItem key={printer.name} value={printer.name}>
                          {printer.name}
                          {printer.isDefault ? ' (Predeterminada)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {station.printerName && isConnected && (
                  <TestPrintButton printerName={station.printerName} />
                )}
                
                {!isDefaultStation(station.id) && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleDeleteStation(station.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {stations.length === 0 && (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <Printer className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">No hay estaciones configuradas</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowNewStationDialog(true)}
              >
                Añadir Estación
              </Button>
            </div>
          )}
        </div>
        
        {/* New Station Dialog */}
        <Dialog open={showNewStationDialog} onOpenChange={setShowNewStationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Estación de Preparación</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="station-name">Nombre de la estación</Label>
                <Input
                  id="station-name"
                  placeholder="Ej: Cocina Fría, Sushi, etc."
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="station-description">Descripción (opcional)</Label>
                <Input
                  id="station-description"
                  placeholder="Descripción breve de la estación"
                  value={newStationDescription}
                  onChange={(e) => setNewStationDescription(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowNewStationDialog(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddStation} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Añadir Estación'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
