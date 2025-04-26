
import React from 'react';
import { PaymentState } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Banknote, CreditCard, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PaymentHistoryListProps {
  payments: PaymentState[];
}

const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({ payments }) => {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No hay pagos registrados aún</p>
        <p className="text-sm text-muted-foreground mt-1">
          Los pagos registrados aparecerán aquí
        </p>
      </div>
    );
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'transfer': return <ArrowRightLeft className="h-4 w-4" />;
      default: return null;
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

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[300px] pr-4">
        {payments.map((payment, index) => (
          <Card key={index} className="mb-3">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-muted">
                    {getPaymentIcon(payment.method)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{getPaymentMethodName(payment.method)}</p>
                    {payment.method === 'cash' && payment.cashReceived && payment.cashReceived > payment.amount && (
                      <p className="text-xs text-muted-foreground">
                        Recibido: {formatCurrency(payment.cashReceived)} | 
                        Cambio: {formatCurrency(payment.cashReceived - payment.amount)}
                      </p>
                    )}
                    {payment.tipAmount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Incluye propina: {formatCurrency(payment.tipAmount)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium">Total pagado:</span>
          <span className="font-bold">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryList;
