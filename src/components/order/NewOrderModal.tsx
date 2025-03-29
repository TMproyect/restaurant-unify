
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { RestaurantTable } from '@/types/tables';
import { supabase } from '@/integrations/supabase/client';
import { filterValue, mapArrayResponse } from '@/utils/supabaseHelpers';
import OrderTaking from './OrderTaking';

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ open, onClose, onSuccess }) => {
  const [orderType, setOrderType] = useState<'table' | 'delivery'>('table');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [orderStep, setOrderStep] = useState<'details' | 'items'>('details');

  useEffect(() => {
    if (open) {
      fetchAvailableTables();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setOrderType('table');
      setSelectedTable('');
      setTableNumber('');
      setCustomerName('');
      setOrderStep('details');
    }
  }, [open]);

  const fetchAvailableTables = async () => {
    try {
      setTablesLoading(true);
      console.log('Fetching available tables...');
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('status', filterValue('available'));

      if (error) {
        console.error('Error fetching tables:', error);
        throw error;
      }

      const tableData = mapArrayResponse<RestaurantTable>(data, 'Failed to map tables');
      console.log('Available tables fetched:', tableData.length);
      setTables(tableData);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Error al cargar mesas disponibles');
    } finally {
      setTablesLoading(false);
    }
  };

  const handleContinue = () => {
    if (orderType === 'table' && !selectedTable) {
      toast.error("Por favor seleccione una mesa");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Por favor ingrese el nombre del cliente");
      return;
    }

    if (orderType === 'table' && selectedTable) {
      const selectedTableObj = tables.find(table => table.id.toString() === selectedTable);
      if (selectedTableObj) {
        setTableNumber(selectedTableObj.number.toString());
      }
    }

    console.log('Continuing to order items with customer:', customerName);
    setOrderStep('items');
  };

  const handleOrderComplete = () => {
    console.log('Order completed successfully');
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {orderStep === 'details' ? 'Nueva Orden' : 'Tomar Pedido'}
          </DialogTitle>
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
                    {tablesLoading ? (
                      <div className="p-2 text-center">Cargando mesas...</div>
                    ) : tables.length > 0 ? (
                      tables.map((table) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          Mesa {table.number} - {table.zone}
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
              customerName={customerName}
              onOrderComplete={handleOrderComplete}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal;
