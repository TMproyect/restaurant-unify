
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface CashAmountInputProps {
  displayValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const CashAmountInput = ({
  displayValue,
  onInputChange,
  onFocus,
  onBlur
}: CashAmountInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="initialCash">Monto Inicial</Label>
      <div className="relative">
        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          id="initialCash"
          type="text" 
          placeholder="0" 
          className="pl-8"
          value={displayValue}
          onChange={onInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          inputMode="decimal"
          required
        />
      </div>
    </div>
  );
};
