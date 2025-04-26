
import React, { useState } from 'react';
import { DollarSign, Loader2, Check, CreditCard, Banknote, ArrowRightLeft, Percent, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentState } from '../types';
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

  // Common cash denominations in Mexico (pesos)
  const cashDenominations = [
    { value: 1000, label: "$1000" },
    { value: 500, label: "$500" },
    { value: 200, label: "$200" },
    { value: 100, label: "$100" },
    { value: 50, label: "$50" },
    { value: 20, label: "$20" },
    { value: 10, label: "$10" },
    { value: 5, label: "$5" },
    { value: 2, label: "$2" },
    { value: 1, label: "$1" },
  ];

  const handleApplyDenomination = (value: number) => {
    const currentCashReceived = currentPayment.cashReceived || 0;
    onPaymentChange({
      ...currentPayment,
      cashReceived: currentCashReceived + value
    });
  };

  const handleApplyTip = (amount: number, percentage: number) => {
    onPaymentChange({
      ...currentPayment,
      tipAmount: amount,
      tipPercentage: percentage
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4 mr-2" />;
      case 'card': return <CreditCard className="h-4 w-4 mr-2" />;
      case 'transfer': return <ArrowRightLeft className="h-4 w-4 mr-2" />;
      default: return <DollarSign className="h-4 w-4 mr-2" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
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

          <div className="mb-4 space-y-4">
            <div>
              <Label htmlFor="paymentAmount">
                Monto a Pagar [{getPaymentMethodName(currentPayment.method)}]
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
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor="cashReceived">Efectivo recibido</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDenominationsMode(!denominationsMode)}
                        className="text-xs h-6 px-2"
                      >
                        {denominationsMode ? "Ocultar denominaciones" : "Mostrar denominaciones"}
                      </Button>
                    </div>
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

                {denominationsMode && (
                  <div className="mt-2">
                    <Label className="mb-2 block">Denominaciones</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {cashDenominations.map(denom => (
                        <Button
                          key={denom.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyDenomination(denom.value)}
                          className="h-10"
                        >
                          {denom.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tip">
          <TipSelector 
            subtotal={subtotal}
            currentTipAmount={currentPayment.tipAmount || 0}
            currentTipPercentage={currentPayment.tipPercentage || 0}
            onApplyTip={handleApplyTip}
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
          
          {allowPartialPayments && pendingAmount > 0 && currentPayment.amount > 0 && (
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
    </div>
  );
};

export default PaymentForm;
