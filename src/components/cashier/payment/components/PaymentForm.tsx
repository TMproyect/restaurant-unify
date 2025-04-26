import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, Check, CreditCard, Banknote, ArrowRightLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PaymentState } from '../types';
import { AmountInput } from './AmountInput';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentSummary from './PaymentSummary';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TipSelector from './TipSelector';
import PaymentHistoryList from './PaymentHistoryList';

interface PaymentFormProps {
  currentPayment: PaymentState;
  onPaymentChange: (payment: PaymentState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onPartialPayment: () => void;
  isProcessing: boolean;
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  tipAmount: number;
  tipPercentage: number;
  total: number;
  change: number;
  pendingAmount: number;
  payments: PaymentState[];
  allowPartialPayments?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  currentPayment,
  onPaymentChange,
  onCancel,
  onSubmit,
  onPartialPayment,
  isProcessing,
  subtotal,
  discount,
  discountType,
  tax,
  tipAmount,
  tipPercentage,
  total,
  change,
  pendingAmount,
  payments,
  allowPartialPayments = false
}) => {
  const [denominationsMode, setDenominationsMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("payment");
  
  // Auto-select total amount when payment method changes
  useEffect(() => {
    if (pendingAmount > 0) {
      onPaymentChange({
        ...currentPayment,
        amount: pendingAmount
      });
    }
  }, [currentPayment.method]);

  // Enable confirm button when valid
  const isPaymentValid = () => {
    if (payments.length === 0 && currentPayment.amount <= 0) return false;
    if (pendingAmount !== 0) return false;
    if (currentPayment.method === 'cash' && 
        (!currentPayment.cashReceived || currentPayment.cashReceived < currentPayment.amount)) {
      return false;
    }
    return true;
  };

  // Show partial payment only for large amounts or specific conditions
  const showPartialPayment = allowPartialPayments && pendingAmount > 50000;

  const handleCashReceived = (value: number) => {
    onPaymentChange({
      ...currentPayment,
      cashReceived: value
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="payment">Pago</TabsTrigger>
          <TabsTrigger value="tip">Propina</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <PaymentMethodSelector
            selectedMethod={currentPayment.method}
            onMethodChange={(value) => onPaymentChange({...currentPayment, method: value})}
          />

          <div className="space-y-4">
            <AmountInput
              id="paymentAmount"
              label={`Monto a Pagar [${
                currentPayment.method === 'cash' ? 'Efectivo' :
                currentPayment.method === 'card' ? 'Tarjeta' : 'Transferencia'
              }]`}
              value={currentPayment.amount}
              onChange={(value) => onPaymentChange({...currentPayment, amount: value})}
              className="bg-primary/5 border-primary/20"
            />

            {currentPayment.method === 'cash' && (
              <AmountInput
                id="cashReceived"
                label="Efectivo Recibido"
                value={currentPayment.cashReceived || 0}
                onChange={handleCashReceived}
                autoFocus
                onEnterPress={() => isPaymentValid() && onSubmit()}
              />
            )}

            {currentPayment.method === 'cash' && currentPayment.cashReceived > 0 && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <Label>Cambio a Devolver</Label>
                <div className="text-2xl font-mono text-right text-primary">
                  ${new Intl.NumberFormat('es-CO').format(change)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tip">
          <TipSelector 
            subtotal={subtotal}
            currentTipAmount={currentPayment.tipAmount || 0}
            currentTipPercentage={currentPayment.tipPercentage || 0}
            onApplyTip={(amount: number, percentage: number) => onPaymentChange({
              ...currentPayment,
              tipAmount: amount,
              tipPercentage: percentage
            })}
          />
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistoryList payments={payments} />
        </TabsContent>
      </Tabs>

      <div className="mt-auto pt-4">
        <PaymentSummary
          subtotal={subtotal}
          discount={discount}
          discountType={discountType}
          tax={tax}
          tipAmount={currentPayment.tipAmount || 0}
          tipPercentage={currentPayment.tipPercentage || 0}
          total={total}
          pendingAmount={pendingAmount}
        />

        <div className="flex justify-between pt-6 gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          
          {showPartialPayment && currentPayment.amount > 0 && (
            <Button 
              variant="secondary"
              onClick={onPartialPayment} 
              disabled={isProcessing || 
                (currentPayment.method === 'cash' && 
                (!currentPayment.cashReceived || currentPayment.cashReceived < currentPayment.amount))}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Pago Parcial
            </Button>
          )}
          
          <Button 
            className="flex-1" 
            onClick={onSubmit}
            disabled={!isPaymentValid() || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Confirmar Pago ${new Intl.NumberFormat('es-CO').format(total)}
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
