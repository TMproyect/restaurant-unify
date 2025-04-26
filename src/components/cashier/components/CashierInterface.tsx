
import React, { useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import OrderDetails from '../OrderDetails';
import PaymentPanel from '../PaymentPanel';
import CashRegisterControls from './CashRegisterControls';
import CashierOrdersSection from './orders/CashierOrdersSection';
import { useToast } from '@/hooks/use-toast';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { CashRegisterShift } from '@/services/cashier';

interface CashierInterfaceProps {
  activeShift: CashRegisterShift;
}

export const CashierInterface: React.FC<CashierInterfaceProps> = ({ activeShift }) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ready' | 'delivered'>('ready');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const handlePaymentStart = () => {
    if (!orderDetails?.order) {
      toast({
        title: "Error",
        description: "Selecciona una orden para procesar el pago",
        variant: "destructive"
      });
      return;
    }
    setIsPaymentSheetOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentSheetOpen(false);
    setSelectedOrder(null);
    setOrderDetails(null);
    toast({
      title: "Pago completado",
      description: "El pago se ha procesado correctamente"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CircleDollarSign size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Punto de Venta / Caja</h1>
        </div>
        <div className="flex gap-3 items-center">
          <PrinterStatus compact />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 border rounded-md p-4">
          <CashierOrdersSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            onSelectOrder={handleOrderSelect}
            selectedOrderId={selectedOrder}
          />
        </div>

        <div className="lg:col-span-1 border rounded-md p-4">
          <OrderDetails 
            orderDetails={orderDetails} 
            isLoading={isLoading}
            onPaymentClick={handlePaymentStart}
          />
        </div>

        <div className="lg:col-span-1 border rounded-md p-4">
          <CashRegisterControls shift={activeShift} />
        </div>
      </div>

      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
          <PaymentPanel 
            orderDetails={orderDetails}
            onCancel={() => setIsPaymentSheetOpen(false)}
            onPaymentComplete={handlePaymentComplete}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
