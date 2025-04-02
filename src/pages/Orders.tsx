
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import OrderTaking from '@/components/order/OrderTaking';
import OrderPrintController from '@/components/OrderPrintController';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewOrderModal from '@/components/order/NewOrderModal';

const Orders = () => {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const handleOrderComplete = () => {
    console.log('Order completed in Orders page');
    // Here you could refresh order data or show a success message
  };

  return (
    <Layout>
      <OrderPrintController>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Toma de Órdenes</h1>
            <div className="flex items-center gap-3">
              <PrinterStatus compact />
              <Button onClick={() => setShowNewOrderModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Orden
              </Button>
            </div>
          </div>
          
          {/* Display NewOrderModal for creating new orders */}
          <NewOrderModal 
            open={showNewOrderModal} 
            onClose={() => setShowNewOrderModal(false)}
            onSuccess={handleOrderComplete}
          />
          
          {/* Hide OrderTaking from main page - it will be shown in the modal */}
        </div>
      </OrderPrintController>
    </Layout>
  );
};

export default Orders;
