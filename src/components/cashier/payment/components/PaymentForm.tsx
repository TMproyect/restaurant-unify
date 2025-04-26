
import React from 'react';
import { DollarSign, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentState } from '../types';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentSummary from './PaymentSummary';

interface PaymentFormProps {
  currentPayment: PaymentState;
  onPaymentChange: (payment: PaymentState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  tipAmount: number;
  tipType: 'percent' | 'amount';
  total: number;
  change: number;
  pendingAmount: number;
  payments: PaymentState[];
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  currentPayment,
  onPaymentChange,
  onCancel,
  onSubmit,
  isProcessing,
  subtotal,
  discount,
  discountType,
  tax,
  tipAmount,
  tipType,
  total,
  change,
  pendingAmount,
  payments
}) => {
  return (
    <div className="flex flex-col h-full">
      <PaymentMethodSelector
        selectedMethod={currentPayment.method}
        onMethodChange={(value) => onPaymentChange({...currentPayment, method: value})}
      />

      <div className="mb-4 space-y-4">
        <div>
          <Label htmlFor="paymentAmount">
            Monto a Pagar [{currentPayment.method === 'cash' ? 'Efectivo' : 
                          currentPayment.method === 'card' ? 'Tarjeta' : 'Transferencia'}]
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="paymentAmount"
              type="number"
              min="0"
              step="0.01"
              className="pl-8"
              value={currentPayment.amount || ''}
              onChange={(e) => onPaymentChange({
                ...currentPayment, 
                amount: parseFloat(e.target.value) || 0
              })}
            />
          </div>
        </div>
        
        {currentPayment.method === 'cash' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cashReceived">Efectivo recibido</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cashReceived"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  placeholder="0.00"
                  value={currentPayment.cashReceived || ''}
                  onChange={(e) => onPaymentChange({
                    ...currentPayment, 
                    cashReceived: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            <div>
              <Label>Cambio</Label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted/50 flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium">{change.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentSummary
        subtotal={subtotal}
        discount={discount}
        discountType={discountType}
        tax={tax}
        tipAmount={tipAmount}
        tipType={tipType}
        total={total}
      />

      <div className="flex justify-between pt-6 gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button 
          className="flex-1" 
          onClick={onSubmit} 
          disabled={
            isProcessing || 
            pendingAmount !== 0 || 
            (payments.length === 0 && currentPayment.amount <= 0)
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Confirmar Pago ${total.toFixed(2)}
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
