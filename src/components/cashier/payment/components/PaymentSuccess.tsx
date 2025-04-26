
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer, Home, Receipt } from 'lucide-react';
import { Order } from '@/types/order.types';
import { PaymentState } from '../types';
import { formatCurrency } from '@/lib/utils';

interface PaymentSuccessProps {
  order: Order;
  total: number;
  payments?: PaymentState[];
  onComplete: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  order,
  total,
  payments = [],
  onComplete,
  onPrint = () => console.log('Print receipt'),
  onEmail = () => console.log('Email receipt')
}) => {
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-sm border">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        
        <h2 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h2>
        <p className="text-muted-foreground mb-6">
          La orden #{order.id?.substring(0, 6) || 'N/A'} ha sido pagada correctamente
        </p>
        
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span>Cliente:</span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Mesa:</span>
            <span className="font-medium">{order.table_number || 'Delivery'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Monto Total:</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
        </div>

        {payments && payments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-left">Detalles del Pago:</h3>
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                  <span>{getPaymentMethodName(payment.method)}</span>
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={onPrint}
            className="flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button 
            variant="outline" 
            onClick={onEmail}
            className="flex items-center justify-center gap-2"
          >
            <Receipt className="h-4 w-4" />
            Enviar email
          </Button>
        </div>
        
        <Button onClick={onComplete} className="w-full">
          <Home className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
