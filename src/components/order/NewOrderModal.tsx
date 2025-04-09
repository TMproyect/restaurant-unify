
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { RestaurantTable } from '@/types/tables';
import { supabase } from '@/integrations/supabase/client';
import { filterValue, mapArrayResponse } from '@/utils/supabaseHelpers';
import OrderTaking from './OrderTaking';
import OrderCustomerForm from './OrderCustomerForm';

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
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setOrderType('table');
    setSelectedTable('');
    setTableNumber('');
    setCustomerName('');
    setOrderStep('details');
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {orderStep === 'details' ? 'Nueva Orden' : 'Tomar Pedido'}
          </DialogTitle>
        </DialogHeader>
        
        {orderStep === 'details' ? (
          <OrderCustomerForm 
            orderType={orderType}
            setOrderType={setOrderType}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            customerName={customerName}
            setCustomerName={setCustomerName}
            tables={tables}
            tablesLoading={tablesLoading}
            onContinue={handleContinue}
          />
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
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
