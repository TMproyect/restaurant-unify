
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
        title: "Error",
        description: "Por favor seleccione una mesa",
        variant: "destructive"
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese el nombre del cliente",
        variant: "destructive"
      });
      return;
    }

    setOrderStep('items');
  };

  const handleOrderComplete = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{orderStep === 'details' ? 'Nueva Orden' : `Mesa ${selectedTable} - ${customerName}`}</DialogTitle>
        </DialogHeader>
        
        {orderStep === 'details' ? (
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="orderType">Tipo de Orden</Label>
              <RadioGroup
                value={orderType}
                onValueChange={(value) => setOrderType(value as 'table' | 'delivery')}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="table" id="table" />
                  <Label htmlFor="table">Mesa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Delivery</Label>
                </div>
              </RadioGroup>
            </div>

            {orderType === 'table' && (
              <div>
                <Label htmlFor="table">Mesa</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="p-2 text-center">Cargando mesas...</div>
                    ) : tables.length > 0 ? (
                      tables.map((table) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          Mesa {table.number}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center">No hay mesas disponibles</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="customerName">Nombre del Cliente</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ingrese el nombre del cliente"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleContinue}>
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <OrderTaking 
              tableId={selectedTable} 
              onOrderComplete={handleOrderComplete}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal;
