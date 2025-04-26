
import React from 'react';
import { Banknote, CreditCard, Receipt } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentMethod } from '../types';

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Efectivo', icon: <Banknote className="h-5 w-5" /> },
  { id: 'card', name: 'Tarjeta', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'transfer', name: 'Transferencia', icon: <Receipt className="h-5 w-5" /> },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (value: string) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Método de Pago</h3>
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={onMethodChange}
        className="grid grid-cols-3 gap-2 mb-4"
      >
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <RadioGroupItem
              value={method.id}
              id={`payment-${method.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`payment-${method.id}`}
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
            >
              {method.icon}
              <span className="mt-1 text-sm">{method.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
