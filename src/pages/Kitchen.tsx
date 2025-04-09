
import React from 'react';
import Layout from '@/components/layout/Layout';
import { TabsContent } from '@/components/ui/tabs';
import { useKitchenData, kitchenOptions } from '@/components/kitchen/useKitchenData';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenStatusTabs from '@/components/kitchen/KitchenStatusTabs';
import KitchenOrdersGrid from '@/components/kitchen/KitchenOrdersGrid';
import AccessDenied from '@/components/kitchen/AccessDenied';
import LoadingIndicator from '@/components/kitchen/LoadingIndicator';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

// Type definition to constrain tab status values
type KitchenTabStatus = 'pending' | 'preparing' | 'ready';

const Kitchen = () => {
  const {
    selectedKitchen,
    setSelectedKitchen,
    orderStatus,
    setOrderStatus,
    orders,
    loading,
    handleRefresh,
    hasViewPermission,
    hasManagePermission,
    getKitchenStats,
    getAverageTime,
    getKitchenName,
    updateOrderStatusInKitchen
  } = useKitchenData();

  const stats = getKitchenStats();

  // Si el usuario no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasViewPermission) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <KitchenHeader
          selectedKitchen={selectedKitchen}
          setSelectedKitchen={setSelectedKitchen}
          kitchenOptions={kitchenOptions}
          stats={stats}
          loading={loading}
          handleRefresh={handleRefresh}
          getAverageTime={getAverageTime}
        />

        <KitchenStatusTabs
          defaultValue="pending"
          onValueChange={(value: KitchenTabStatus) => setOrderStatus(value as NormalizedOrderStatus)}
          pendingCount={stats.pendingItems}
          preparingCount={stats.preparingItems}
          completedCount={stats.completedItems}
        >
          {loading ? (
            <LoadingIndicator />
          ) : (
            <>
              <TabsContent value="pending" className="mt-4">
                <KitchenOrdersGrid
                  orders={orders}
                  orderStatus="pending"
                  hasManagePermission={hasManagePermission}
                  updateOrderStatus={updateOrderStatusInKitchen}
                  getKitchenName={getKitchenName}
                  selectedKitchen={selectedKitchen}
                />
              </TabsContent>

              <TabsContent value="preparing" className="mt-4">
                <KitchenOrdersGrid
                  orders={orders}
                  orderStatus="preparing"
                  hasManagePermission={hasManagePermission}
                  updateOrderStatus={updateOrderStatusInKitchen}
                  getKitchenName={getKitchenName}
                  selectedKitchen={selectedKitchen}
                />
              </TabsContent>

              <TabsContent value="ready" className="mt-4">
                <KitchenOrdersGrid
                  orders={orders}
                  orderStatus="ready"
                  hasManagePermission={hasManagePermission}
                  updateOrderStatus={updateOrderStatusInKitchen}
                  getKitchenName={getKitchenName}
                  selectedKitchen={selectedKitchen}
                />
              </TabsContent>
            </>
          )}
        </KitchenStatusTabs>
      </div>
    </Layout>
  );
};

export default Kitchen;
