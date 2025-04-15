
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useKitchenData, kitchenOptions } from '@/components/kitchen/hooks/useKitchenData';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenStatusTabs from '@/components/kitchen/KitchenStatusTabs';
import KitchenOrdersGrid from '@/components/kitchen/KitchenOrdersGrid';
import KitchenSettings from '@/components/kitchen/KitchenSettings';
import AccessDenied from '@/components/kitchen/AccessDenied';
import LoadingIndicator from '@/components/kitchen/LoadingIndicator';
import { KitchenTabStatus } from '@/components/kitchen/types';

const Kitchen = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const {
    selectedKitchen,
    setSelectedKitchen,
    orderStatus,
    setOrderStatus,
    orders,
    loading,
    refreshKey,
    handleRefresh,
    hasViewPermission,
    hasManagePermission,
    getKitchenStats,
    getAverageTime,
    getKitchenName,
    updateOrderStatusInKitchen,
    urgencyThreshold,
    setUrgencyThreshold,
    showOnlyToday,
    setShowOnlyToday
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
        <div className="flex justify-between items-center">
          <KitchenHeader
            selectedKitchen={selectedKitchen}
            setSelectedKitchen={setSelectedKitchen}
            kitchenOptions={kitchenOptions}
            stats={stats}
            loading={loading}
            handleRefresh={handleRefresh}
            getAverageTime={getAverageTime}
          />
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-md">
              <Switch 
                id="today-filter" 
                checked={showOnlyToday}
                onCheckedChange={setShowOnlyToday}
              />
              <Label htmlFor="today-filter" className="text-sm flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Solo hoy
              </Label>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={16} />
              <span className="hidden md:inline">Configuración</span>
            </Button>
          </div>
        </div>

        <KitchenStatusTabs
          defaultValue="pending"
          onValueChange={(value: KitchenTabStatus) => setOrderStatus(value)}
          pendingCount={stats.pendingItems}
          preparingCount={stats.preparingItems}
          completedCount={stats.completedItems}
          cancelledCount={stats.cancelledItems}
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
                  urgencyThreshold={urgencyThreshold}
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
                  urgencyThreshold={urgencyThreshold}
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
                  urgencyThreshold={urgencyThreshold}
                />
              </TabsContent>
              
              <TabsContent value="cancelled" className="mt-4">
                <KitchenOrdersGrid
                  orders={orders}
                  orderStatus="cancelled"
                  hasManagePermission={hasManagePermission}
                  updateOrderStatus={updateOrderStatusInKitchen}
                  getKitchenName={getKitchenName}
                  selectedKitchen={selectedKitchen}
                  urgencyThreshold={urgencyThreshold}
                />
              </TabsContent>
            </>
          )}
        </KitchenStatusTabs>
      </div>
      
      {/* Kitchen Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración de Cocina</DialogTitle>
          </DialogHeader>
          <KitchenSettings 
            initialThreshold={urgencyThreshold}
            onThresholdChange={setUrgencyThreshold}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Kitchen;

