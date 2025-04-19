
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CashierOrdersList from '@/components/cashier/CashierOrdersList';
import OrderDetails from '@/components/cashier/OrderDetails';
import PaymentPanel from '@/components/cashier/PaymentPanel';
import CashRegisterControls from '@/components/cashier/CashRegisterControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getOrders, getOrderWithItems, Order } from '@/services/orderService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CircleDollarSign, Receipt, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { useCashRegister } from '@/hooks/use-cash-register';
import OpenShiftForm from '@/components/cashier/OpenShiftForm';
import { useAuth } from '@/contexts/auth/AuthContext';

const Cashier = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ready' | 'delivered'>('ready');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const { toast } = useToast();
  const { activeShift, isShiftActive, isLoading: isShiftLoading } = useCashRegister();
  const { user } = useAuth();

  useEffect(() => {
    if (selectedOrder) {
      loadOrderDetails(selectedOrder);
    }
  }, [selectedOrder]);

  const loadOrderDetails = async (orderId: string) => {
    try {
      setIsLoading(true);
      console.log(`Loading details for order: ${orderId}`);
      const result = await getOrderWithItems(orderId);
      
      if (!result.order) {
        toast({
          title: "Error",
          description: "No se pudo cargar los detalles de la orden",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Order details loaded:", result);
      setOrderDetails(result);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los detalles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Si está cargando el estado del turno, mostrar loading
  if (isShiftLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <CircleDollarSign className="mx-auto h-12 w-12 text-primary animate-pulse mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Cargando Caja</h2>
            <p className="text-muted-foreground">Verificando estado del turno...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Si no hay un turno activo, mostrar el formulario de apertura
  if (!isShiftActive) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CircleDollarSign size={24} className="text-primary" />
            <h1 className="text-2xl font-bold">Punto de Venta / Caja</h1>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-amber-800 mb-2">Apertura de Caja Requerida</h2>
            <p className="text-amber-700 mb-3">
              Para acceder a la funcionalidad completa del Punto de Venta, es necesario iniciar un turno de caja.
              Por favor ingresa el monto inicial con el que comienzas tu turno.
            </p>
          </div>
          
          <OpenShiftForm />
        </div>
      </Layout>
    );
  }

  // Mostrar la interfaz principal de caja cuando hay un turno activo
  return (
    <Layout>
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
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2 flex items-center">
                <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                Órdenes Pendientes
              </h2>
              <div className="flex mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por mesa, cliente o código..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Tabs defaultValue="ready" onValueChange={(value) => setFilter(value as 'ready' | 'delivered')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ready">Listos para Cobrar</TabsTrigger>
                  <TabsTrigger value="delivered">Pagadas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <CashierOrdersList 
              filter={filter}
              searchQuery={searchQuery}
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
    </Layout>
  );
};

export default Cashier;
