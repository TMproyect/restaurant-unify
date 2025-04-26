
import React from 'react';
import { Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PaymentSummaryProps {
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  tipAmount: number;
  tipType: 'percent' | 'amount';
  total: number;
}

const PaymentSummary = ({
  subtotal,
  discount,
  discountType,
  tax,
  tipAmount,
  tipType,
  total
}: PaymentSummaryProps) => {
  return (
    <div className="flex-grow">
      <h3 className="font-medium mb-2">Resumen</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center">
              <Percent className="h-3 w-3 mr-1" />
              Descuento {discountType === 'percent' ? `(${discount}%)` : ''}:
            </span>
            <span className="text-green-600">
              -${(discountType === 'percent' ? subtotal * (discount/100) : discount).toFixed(2)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA (16%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        {tipAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Propina {tipType === 'percent' ? `(${tipAmount}%)` : ''}:
            </span>
            <span>${(tipType === 'percent' ? subtotal * (tipAmount/100) : tipAmount).toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <Separator className="my-3" />
      
      <div className="flex justify-between text-lg font-bold">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
