
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
  
  // Set payment amount based on selected payment method
  useEffect(() => {
    if (pendingAmount > 0) {
      // For card and transfer, automatically select the pending amount
      // For cash, let the user enter the amount manually
      const autoSelectAmount = currentPayment.method !== 'cash' 
        ? pendingAmount 
        : pendingAmount;
      
      onPaymentChange({
        ...currentPayment,
        amount: autoSelectAmount
      });
    }
  }, [currentPayment.method, pendingAmount]);

  const isPaymentValid = () => {
    // Valid payment requirements:
    // 1. Payment amount must be greater than 0
    // 2. If cash payment, cash received must be >= payment amount
    // 3. For partial payments, we check separately
    
    // For completed payments (no pending amount)
    if (pendingAmount === 0) {
      return true;
    }
    
    const isValidPaymentAmount = currentPayment.amount > 0;
    
    const isCashPaymentValid = currentPayment.method !== 'cash' || 
      (currentPayment.cashReceived && currentPayment.cashReceived >= currentPayment.amount);
    
    return isValidPaymentAmount && isCashPaymentValid;
  };

  const showPartialPayment = 
    allowPartialPayments && 
    pendingAmount > 50000 && 
    currentPayment.amount > 0 && 
    currentPayment.amount < pendingAmount;

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
              readOnly={true} // Force read-only to prevent manual editing
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
            
            {currentPayment.method === 'card' && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Esperando Terminal...</Label>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Inserte, deslice o acerque la tarjeta al datáfono para procesar el pago
                </div>
              </div>
            )}
            
            {currentPayment.method === 'transfer' && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <Label className="text-sm">Información de Transferencia</Label>
                <div className="p-2 bg-background rounded border">
                  <p className="text-sm">Banco: <span className="font-medium">Bancolombia</span></p>
                  <p className="text-sm">Cuenta: <span className="font-medium">1234 5678 9012</span></p>
                  <p className="text-sm">Titular: <span className="font-medium">Restaurante Demo S.A.S</span></p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Check className="mr-2 h-4 w-4" />
                  Verificar Transferencia
                </Button>
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
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          
          {showPartialPayment && (
            <Button 
              variant="secondary"
              onClick={onPartialPayment} 
              disabled={isProcessing || !currentPayment.amount}
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
