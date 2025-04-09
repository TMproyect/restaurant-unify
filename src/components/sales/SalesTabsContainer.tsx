
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesOverviewTab from './SalesOverviewTab';
import ProductSalesTab from './ProductSalesTab';
import TransactionsTab from './TransactionsTab';
import { TransactionData } from '@/services/salesService';

interface SalesTabsContainerProps {
  salesData: any[];
  productSalesData: any[];
  recentTransactions: TransactionData[];
}

const SalesTabsContainer: React.FC<SalesTabsContainerProps> = ({ 
  salesData, 
  productSalesData, 
  recentTransactions 
}) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="products">Por Producto</TabsTrigger>
        <TabsTrigger value="transactions">Transacciones</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        <SalesOverviewTab salesData={salesData} />
      </TabsContent>

      <TabsContent value="products" className="mt-4">
        <ProductSalesTab productSalesData={productSalesData} />
      </TabsContent>

      <TabsContent value="transactions" className="mt-4">
        <TransactionsTab recentTransactions={recentTransactions} />
      </TabsContent>
    </Tabs>
  );
};

export default SalesTabsContainer;
