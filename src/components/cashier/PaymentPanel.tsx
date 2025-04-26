
import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/services/orderService';
import { PaymentState, OrderPaymentDetails } from './payment/types';
import PaymentMethodSelector from './payment/components/PaymentMethodSelector';
import PaymentSummary from './payment/components/PaymentSummary';
import PaymentSuccess from './payment/components/PaymentSuccess';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTip,
  calculateTotal,
} from './payment/utils/calculations';

interface PaymentPanelProps {
  orderDetails: OrderPaymentDetails | null;
  onCancel: () => void;
  onPaymentComplete: () => void;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  orderDetails, 
  onCancel,
  onPaymentComplete
}) => {
  const { order, items } = orderDetails || { order: null, items: [] };
  const [paymentStep, setPaymentStep] = useState<'form' | 'success'>('form');
  const [payments, setPayments] = useState<PaymentState[]>([]);
  const [currentPayment, setCurrentPayment] = useState<PaymentState>({
    method: 'cash',
    amount: 0,
    cashReceived: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState(order?.discount || 0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipType, setTipType] = useState<'percent' | 'amount'>('percent');
  const [change, setChange] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      const pendingAmount = calculatePendingAmount();
      setCurrentPayment(prev => ({ ...prev, amount: pendingAmount }));
    }
  }, [order, payments]);

  useEffect(() => {
    if (currentPayment.method === 'cash' && currentPayment.cashReceived) {
      const cashReceived = currentPayment.cashReceived || 0;
      const amount = currentPayment.amount || 0;
      setChange(cashReceived >= amount ? cashReceived - amount : 0);
    } else {
      setChange(0);
    }
  }, [currentPayment]);

  const subtotal = calculateSubtotal(items);
  const discountValue = calculateDiscount(subtotal, discountType, discount);
  const tax = calculateTax(subtotal, discountValue);
  const tipValue = calculateTip(subtotal, tipType, tipAmount);
  const total = calculateTotal(subtotal, discountValue, tax, tipValue);

  const calculatePendingAmount = () => {
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, total - paidAmount);
  };

  const handlePayment = async () => {
    if (!order?.id) {
      toast({
        title: "Error",
        description: "No hay una orden seleccionada para procesar",
        variant: "destructive"
      });
      return;
    }

    const pendingAmount = calculatePendingAmount();
    const isValid = pendingAmount === 0 || 
                    (currentPayment.amount > 0 && currentPayment.amount === pendingAmount);
    
    if (!isValid) {
      toast({
        title: "Error",
        description: "El monto total no coincide con el monto pendiente",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPayment.amount > 0) {
      if (currentPayment.method === 'cash' && 
          (!currentPayment.cashReceived || currentPayment.cashReceived < currentPayment.amount)) {
        toast({
          title: "Error",
          description: "El efectivo recibido debe ser igual o mayor al monto a pagar",
          variant: "destructive"
        });
        return;
      }
      
      setPayments([...payments, currentPayment]);
    }
    
    try {
      setIsProcessing(true);
      const success = await updateOrderStatus(order.id, 'paid');
      
      if (success) {
        setPaymentStep('success');
      } else {
        throw new Error("No se pudo actualizar el estado de la orden");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error de pago",
        description: "Ocurrió un error al procesar el pago",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    toast({
      title: "Ticket impreso",
      description: "El ticket de venta se ha enviado a la impresora"
    });
  };

  const handlePrintInvoice = () => {
    toast({
      title: "Factura generada",
      description: "La factura fiscal se ha enviado a la impresora"
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Recibo enviado",
      description: "El recibo digital ha sido enviado por correo electrónico"
    });
  };

  if (!order) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-1">No hay orden seleccionada</h3>
        <p className="text-muted-foreground">
          Regresa y selecciona una orden para procesar el pago
        </p>
        <Button className="mt-6" onClick={onCancel}>Regresar</Button>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <PaymentSuccess
        order={order}
        total={total}
        onPrintReceipt={handlePrintReceipt}
        onPrintInvoice={handlePrintInvoice}
        onSendEmail={handleSendEmail}
        onComplete={onPaymentComplete}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Payment Form Content */}
      <PaymentMethodSelector
        selectedMethod={currentPayment.method}
        onMethodChange={(value) => setCurrentPayment({...currentPayment, method: value})}
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
              onChange={(e) => setCurrentPayment({
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
                  onChange={(e) => setCurrentPayment({
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
          onClick={handlePayment} 
          disabled={
            isProcessing || 
            calculatePendingAmount() !== 0 || 
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

export default PaymentPanel;
