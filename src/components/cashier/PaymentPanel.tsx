import React, { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/services/orderService';
import { PaymentState, OrderPaymentDetails } from './payment/types';
import PaymentSuccess from './payment/components/PaymentSuccess';
import PaymentForm from './payment/components/PaymentForm';
import usePaymentCalculations from './payment/hooks/usePaymentCalculations';
import { useDailySummary } from '@/hooks/cashier/use-daily-summary';
import { registerPayment } from '@/services/cashier/paymentService';

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
    cashReceived: 0,
    tipAmount: 0,
    tipPercentage: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { updateDailySummary } = useDailySummary();

  const {
    subtotal,
    discountValue,
    tax,
    tipValue,
    total,
    change,
    pendingAmount,
    calculatedTip,
  } = usePaymentCalculations({
    items,
    discount: order?.discount || 0,
    discountType: 'percent',
    tipAmount: currentPayment.tipAmount || 0,
    tipPercentage: currentPayment.tipPercentage || 0,
    currentPayment,
    payments
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentState[]>([]);

  useEffect(() => {
    if (order) {
      setCurrentPayment(prev => ({ 
        ...prev, 
        amount: pendingAmount,
        tipAmount: 0,
        tipPercentage: 0
      }));
    }
  }, [order, payments, pendingAmount]);

  const addPayment = (payment: PaymentState) => {
    const newPayments = [...payments, payment];
    setPayments(newPayments);
    setPaymentHistory(prev => [...prev, payment]);
    
    setCurrentPayment({
      method: 'cash',
      amount: pendingAmount - payment.amount,
      cashReceived: 0,
      tipAmount: 0,
      tipPercentage: 0
    });
    
    toast({
      title: "Pago parcial registrado",
      description: `${payment.method === 'cash' ? 'Efectivo' : payment.method === 'card' ? 'Tarjeta' : 'Transferencia'}: $${payment.amount.toFixed(2)}`,
    });
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

    if (currentPayment.amount > 0 && pendingAmount > 0) {
      if (currentPayment.method === 'cash' && 
        (!currentPayment.cashReceived || currentPayment.cashReceived < currentPayment.amount)) {
        toast({
          title: "Error",
          description: "El efectivo recibido debe ser igual o mayor al monto a pagar",
          variant: "destructive"
        });
        return;
      }

      addPayment(currentPayment);
      
      if (pendingAmount - currentPayment.amount > 0) {
        return;
      }
    }
    
    try {
      setIsProcessing(true);

      const allPayments = [...payments];
      if (currentPayment.amount > 0) {
        allPayments.push(currentPayment);
      }

      const paymentData = {
        orderId: order.id,
        payments: allPayments,
        total: total,
        subtotal: subtotal,
        discount: discountValue,
        tax: tax,
        tip: calculatedTip,
        paymentDate: new Date().toISOString()
      };

      await registerPayment(paymentData);
      
      const success = await updateOrderStatus(order.id, 'delivered');
      
      await updateDailySummary({
        sales: total,
        orderCount: 1,
        payments: allPayments
      });
      
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
        onComplete={onPaymentComplete}
        payments={paymentHistory.length > 0 ? paymentHistory : payments}
      />
    );
  }

  return (
    <PaymentForm
      currentPayment={currentPayment}
      onPaymentChange={setCurrentPayment}
      onCancel={onCancel}
      onSubmit={handlePayment}
      onPartialPayment={() => currentPayment.amount > 0 && addPayment(currentPayment)}
      isProcessing={isProcessing}
      subtotal={subtotal}
      discount={order.discount || 0}
      discountType="percent"
      tax={tax}
      tipAmount={currentPayment.tipAmount || 0}
      tipPercentage={currentPayment.tipPercentage || 0}
      total={total}
      change={change}
      pendingAmount={pendingAmount}
      payments={payments}
      allowPartialPayments={true}
    />
  );
};

export default PaymentPanel;
