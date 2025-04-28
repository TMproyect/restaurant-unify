
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import OrderTaking from '@/components/order/OrderTaking';
import OrderPrintController from '@/components/OrderPrintController';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import NewOrderModal from '@/components/order/NewOrderModal';
import OrdersList from '@/components/dashboard/OrdersList';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { getOrderWithItems } from '@/services/orderService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import WaiterTableView from '@/components/order/WaiterTableView';

const Orders = () => {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { hasPermission, isWaiter, isAdmin, isManager } = usePermissions();
  
  // Check permissions
  const canViewTables = hasPermission('tables.view');
  const canCreateOrders = hasPermission('orders.create');
  const canViewArchived = hasPermission('orders.view_archived');
  
  console.log('🔍 [Orders] Comprobando permisos del usuario:', { 
    role: user?.role, 
    isWaiter,
    isAdmin,
    isManager,
    canViewTables,
    canCreateOrders,
    canViewArchived
  });
  
  const handleOrderComplete = () => {
    console.log('Order completed in Orders page');
    handleRefresh();
    toast.success('Orden creada exitosamente');
  };
  
  const handleRefresh = () => {
    console.log('Refreshing orders list');
    setRefreshKey(prev => prev + 1);
  };
  
  // Verificar si hay un ID de orden en los parámetros de búsqueda
  useEffect(() => {
    const orderId = searchParams.get('id');
    if (orderId) {
      console.log('Order ID found in URL:', orderId);
      setIsLoading(true);
      
      getOrderWithItems(orderId)
        .then(({ order, items }) => {
          if (order) {
            console.log('Order details loaded:', order);
            console.log('Order items:', items);
            
            toast.success(`Orden cargada: Cliente: ${order.customer_name} - Mesa: ${order.table_number || 'Delivery'}`, {
              action: {
                label: "Ver",
                onClick: () => {
                  window.location.href = `/orders?id=${order.id}`;
                }
              }
            });
          } else {
            console.log('Order not found');
            toast.error(`No se encontró la orden con ID: ${orderId}`);
          }
        })
        .catch(error => {
          console.error('Error loading order:', error);
          toast.error('Error al cargar los detalles de la orden');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchParams]);

  // Renderizar vista específica para meseros si el usuario tiene ese rol
  if (isWaiter && canViewTables) {
    return (
      <Layout>
        <OrderPrintController>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gestión de Mesas y Órdenes</h1>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <PrinterStatus compact />
                {canCreateOrders && (
                  <Button onClick={() => setShowNewOrderModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                  </Button>
                )}
              </div>
            </div>
            
            {/* Vista de mesas para meseros */}
            <WaiterTableView 
              onCreateOrder={() => setShowNewOrderModal(true)} 
              onRefresh={handleRefresh}
              refreshKey={refreshKey}
            />
            
            {/* Display NewOrderModal for creating new orders */}
            <NewOrderModal 
              open={showNewOrderModal} 
              onClose={() => setShowNewOrderModal(false)}
              onSuccess={handleOrderComplete}
            />
          </div>
        </OrderPrintController>
      </Layout>
    );
  }

  // Si no es mesero, mostrar la vista estándar de órdenes
  return (
    <Layout>
      <OrderPrintController>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Toma de Órdenes</h1>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <PrinterStatus compact />
              {canCreateOrders && (
                <Button onClick={() => setShowNewOrderModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              )}
            </div>
          </div>
          
          {/* Display NewOrderModal for creating new orders */}
          <NewOrderModal 
            open={showNewOrderModal} 
            onClose={() => setShowNewOrderModal(false)}
            onSuccess={handleOrderComplete}
          />
          
          {/* Orders list */}
          <div className="border rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Órdenes Recientes</h2>
            </div>
            <OrdersList 
              key={refreshKey} 
              limit={20} 
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </OrderPrintController>
    </Layout>
  );
};

export default Orders;
