
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
import { Search, CashRegister, Receipt, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const Cashier = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ready' | 'delivered'>('ready');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const { toast } = useToast();

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

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CashRegister size={24} className="text-primary" />
            <h1 className="text-2xl font-bold">Punto de Venta / Caja</h1>
          </div>
          <Button onClick={() => setIsPaymentSheetOpen(true)} disabled={!selectedOrder}>
            <Receipt className="mr-2 h-4 w-4" />
            Procesar Pago
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left panel - Orders list */}
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
                  <TabsTrigger value="delivered">Entregados</TabsTrigger>
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

          {/* Middle panel - Order details */}
          <div className="lg:col-span-1 border rounded-md p-4">
            <OrderDetails 
              orderDetails={orderDetails} 
              isLoading={isLoading}
              onPaymentClick={handlePaymentStart}
            />
          </div>

          {/* Right panel - Cash register controls */}
          <div className="lg:col-span-1 border rounded-md p-4">
            <CashRegisterControls />
          </div>
        </div>
      </div>

      {/* Payment slide-out panel */}
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
