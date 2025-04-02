
import React from 'react';
import Layout from '@/components/layout/Layout';
import OrderTaking from '@/components/order/OrderTaking';
import OrderPrintController from '@/components/OrderPrintController';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';

const Orders = () => {
  return (
    <Layout>
      <OrderPrintController>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Toma de Órdenes</h1>
            <PrinterStatus compact />
          </div>
          <OrderTaking />
        </div>
      </OrderPrintController>
    </Layout>
  );
};

export default Orders;
