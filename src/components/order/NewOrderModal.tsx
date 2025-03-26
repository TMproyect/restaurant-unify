
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { RestaurantTable } from '@/types/tables';
import { createOrder } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import OrderTaking from './OrderTaking';

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ open, onClose, onSuccess }) => {
  const [orderType, setOrderType] = useState<'table' | 'delivery'>('table');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderStep, setOrderStep] = useState<'details' | 'items'>('details');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadAvailableTables();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setOrderType('table');
      setSelectedTable('');
      setCustomerName('');
      setOrderStep('details');
    }
  }, [open]);

  const loadAvailableTables = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('status', 'available')
        .order('number', { ascending: true });
      
      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error cargando mesas disponibles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las mesas disponibles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (orderType === 'table' && !selectedTable) {
      toast({
        title: "Mesa requerida",
        description: "Por favor, seleccione una mesa para la orden",
        variant: "destructive"
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Nombre de cliente requerido",
        description: "Por favor, ingrese el nombre del cliente",
        variant: "destructive"
      });
      return;
    }

    setOrderStep('items');
  };

  const handleOrderComplete = async () => {
    try {
      // Actualizar el estado de la mesa si se eligió una
      if (orderType === 'table' && selectedTable) {
        await supabase
          .from('restaurant_tables')
          .update({ status: 'occupied' })
          .eq('id', selectedTable);
      }
      
      onSuccess();
      onClose();
      
      toast({
        title: "Orden creada",
        description: "La orden ha sido enviada a cocina"
      });
    } catch (error) {
      console.error('Error actualizando mesa:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la mesa",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    setOrderStep('details');
  };

  const getSelectedTableNumber = () => {
    const table = tables.find(t => t.id === selectedTable);
    return table ? table.number : 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nueva Orden</DialogTitle>
        </DialogHeader>
        
        {orderStep === 'details' ? (
          <div className="space-y-4 py-4">
            <RadioGroup
              defaultValue={orderType}
              value={orderType}
              onValueChange={(value) => setOrderType(value as 'table' | 'delivery')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="table" id="r1" />
                <Label htmlFor="r1">Mesa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="r2" />
                <Label htmlFor="r2">Delivery</Label>
              </div>
            </RadioGroup>

            {orderType === 'table' && (
              <div className="space-y-2">
                <Label htmlFor="table">Mesa</Label>
                <Select 
                  value={selectedTable} 
                  onValueChange={setSelectedTable}
                >
                  <SelectTrigger id="table">
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Mesa {table.number} - {table.zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customer">Nombre del Cliente</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej: Carlos Mendez"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleContinue}>Continuar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
            <div className="bg-secondary/20 p-3 rounded flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">
                  {orderType === 'table' ? `Mesa ${getSelectedTableNumber()}` : 'Delivery'}
                </p>
                <p className="text-xs text-muted-foreground">Cliente: {customerName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleBack}>
                Cambiar
              </Button>
            </div>
            
            <div className="flex-grow overflow-hidden">
              <OrderTaking 
                tableId={orderType === 'table' ? String(getSelectedTableNumber()) : 'Delivery'} 
                onOrderComplete={handleOrderComplete} 
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal;
