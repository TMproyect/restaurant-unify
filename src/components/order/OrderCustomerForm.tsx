
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RestaurantTable } from '@/types/tables';

interface OrderCustomerFormProps {
  orderType: 'table' | 'delivery';
  setOrderType: (type: 'table' | 'delivery') => void;
  selectedTable: string;
  setSelectedTable: (tableId: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tables: RestaurantTable[];
  tablesLoading: boolean;
  onContinue: () => void;
}

const OrderCustomerForm: React.FC<OrderCustomerFormProps> = ({
  orderType,
  setOrderType,
  selectedTable,
  setSelectedTable,
  customerName,
  setCustomerName,
  tables,
  tablesLoading,
  onContinue
}) => {
  return (
    <div className="p-6 space-y-4 overflow-y-auto">
      <div>
        <Label htmlFor="orderType" className="text-base font-medium">Tipo de Orden</Label>
        <RadioGroup
          value={orderType}
          onValueChange={(value) => setOrderType(value as 'table' | 'delivery')}
          className="flex space-x-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="table" id="table" />
            <Label htmlFor="table" className="text-base">Mesa</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="text-base">Delivery</Label>
          </div>
        </RadioGroup>
      </div>

      {orderType === 'table' && (
        <div>
          <Label htmlFor="table" className="text-base font-medium">Mesa</Label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="mt-1">
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
        <Label htmlFor="customerName" className="text-base font-medium">Nombre del Cliente</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Ingrese el nombre del cliente"
          className="mt-1"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onContinue} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default OrderCustomerForm;
