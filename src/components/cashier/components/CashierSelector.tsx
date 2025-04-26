
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CashierSelectorProps {
  cashierName: string;
}

export const CashierSelector = ({ cashierName }: CashierSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="cashier">Cajero</Label>
      <Select defaultValue="current" disabled>
        <SelectTrigger id="cashier">
          <SelectValue placeholder="Seleccionar cajero" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">{cashierName || 'Usuario Actual'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
