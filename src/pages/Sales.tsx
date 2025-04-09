
import React from 'react';
import Layout from '@/components/layout/Layout';
import SalesHeader from '@/components/sales/SalesHeader';
import SalesSummaryCards from '@/components/sales/SalesSummaryCards';
import SalesTabsContainer from '@/components/sales/SalesTabsContainer';
import LoadingIndicator from '@/components/sales/LoadingIndicator';
import { useSalesData } from '@/hooks/use-sales-data';

const Sales = () => {
  const {
    date,
    setDate,
    period,
    setPeriod,
    isLoading,
    salesSummary,
    salesData,
    productSalesData,
    recentTransactions
  } = useSalesData();

  return (
    <Layout>
      <div className="space-y-4">
        <SalesHeader 
          date={date}
          setDate={setDate}
          period={period}
          setPeriod={setPeriod}
        />

        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <SalesSummaryCards salesSummary={salesSummary} />
            <SalesTabsContainer 
              salesData={salesData}
              productSalesData={productSalesData}
              recentTransactions={recentTransactions}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Sales;
