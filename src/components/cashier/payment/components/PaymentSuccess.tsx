
import React from 'react';
import { Check, Printer, FileText, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PaymentSuccessProps {
  order: any;
  total: number;
  onPrintReceipt: () => void;
  onPrintInvoice: () => void;
  onSendEmail: () => void;
  onComplete: () => void;
}

const PaymentSuccess = ({
  order,
  total,
  onPrintReceipt,
  onPrintInvoice,
  onSendEmail,
  onComplete
}: PaymentSuccessProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-green-600">Pago Registrado Exitosamente</h2>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`} • #{order.id?.substring(0, 6)}
        </Badge>
      </div>
      
      <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-200">
        <div className="text-center mb-2">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-medium">Total Cobrado: ${total.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-lg">¿Qué desea hacer ahora?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={onPrintReceipt}
          >
            <Printer className="h-4 w-4" />
            Imprimir Ticket
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={onPrintInvoice}
          >
            <FileText className="h-4 w-4" />
            Imprimir Factura Fiscal
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={onSendEmail}
          >
            <Mail className="h-4 w-4" />
            Enviar Recibo por Email
          </Button>
        </div>
      </div>
      
      <div className="flex-grow"></div>
      <Button 
        size="lg" 
        className="w-full mt-4" 
        onClick={onComplete}
      >
        Finalizar / Nueva Venta
      </Button>
    </div>
  );
};

export default PaymentSuccess;
