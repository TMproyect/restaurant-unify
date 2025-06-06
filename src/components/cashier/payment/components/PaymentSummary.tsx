
import React from 'react';
import { Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PaymentSummaryProps } from '../types';
import { formatCurrency } from '@/lib/utils';

const PaymentSummary = ({
  subtotal,
  discount,
  discountType,
  tax,
  tipAmount,
  tipPercentage,
  total,
  pendingAmount
}: PaymentSummaryProps) => {
  return (
    <div className="flex-grow">
      <h3 className="font-medium mb-2">Resumen</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center">
              <Percent className="h-3 w-3 mr-1" />
              Descuento {discountType === 'percent' ? `(${discount}%)` : ''}:
            </span>
            <span className="text-green-600">
              -{formatCurrency(discountType === 'percent' ? subtotal * (discount/100) : discount)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA (16%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        {tipAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Propina {tipPercentage > 0 ? `(${tipPercentage}%)` : ''}:
            </span>
            <span>{formatCurrency(tipAmount)}</span>
          </div>
        )}

        {pendingAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Pendiente por pagar:</span>
            <span>{formatCurrency(pendingAmount)}</span>
          </div>
        )}
      </div>
      
      <Separator className="my-3" />
      
      <div className="flex justify-between text-lg font-bold">
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
