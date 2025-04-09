
import { useState, useEffect } from 'react';
import { RestaurantTable } from '@/types/tables';
import { supabase } from '@/integrations/supabase/client';
import { filterValue, mapArrayResponse } from '@/utils/supabaseHelpers';
import { toast } from 'sonner';

export interface OrderFormState {
  orderType: 'table' | 'delivery';
  selectedTable: string;
  tableNumber: string;
  customerName: string;
  orderStep: 'details' | 'items';
}

export const useOrderForm = (isOpen: boolean) => {
  const [formState, setFormState] = useState<OrderFormState>({
    orderType: 'table',
    selectedTable: '',
    tableNumber: '',
    customerName: '',
    orderStep: 'details',
  });
  
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTables();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

  const resetForm = () => {
    setFormState({
      orderType: 'table',
      selectedTable: '',
      tableNumber: '',
      customerName: '',
      orderStep: 'details',
    });
  };

  const updateFormState = (newState: Partial<OrderFormState>) => {
    setFormState(prev => ({ ...prev, ...newState }));
  };

  const validateCustomerDetails = (): boolean => {
    if (formState.orderType === 'table' && !formState.selectedTable) {
      toast.error("Por favor seleccione una mesa");
      return false;
    }

    if (!formState.customerName.trim()) {
      toast.error("Por favor ingrese el nombre del cliente");
      return false;
    }

    return true;
  };

  const prepareForOrderItems = () => {
    if (!validateCustomerDetails()) return false;

    if (formState.orderType === 'table' && formState.selectedTable) {
      const selectedTableObj = tables.find(table => table.id.toString() === formState.selectedTable);
      if (selectedTableObj) {
        updateFormState({ tableNumber: selectedTableObj.number.toString() });
      }
    }

    updateFormState({ orderStep: 'items' });
    return true;
  };

  return {
    formState,
    tables,
    tablesLoading,
    updateFormState,
    prepareForOrderItems,
    resetForm,
  };
};
