
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import OrderTaking from '@/components/order/OrderTaking';
import OrderPrintController from '@/components/OrderPrintController';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle, Archive } from 'lucide-react';
import NewOrderModal from '@/components/order/NewOrderModal';
import OrdersList from '@/components/dashboard/OrdersList';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getOrderWithItems } from '@/services/orderService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import WaiterTableView from '@/components/order/WaiterTableView';
import { useArchive } from '@/hooks/dashboard/use-archive';

const Orders = () => {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get archived parameter from URL and convert to boolean
  const [showArchived, setShowArchived] = useState(() => searchParams.get('archived') === 'true');
  
  const { user } = useAuth();
  const { hasPermission, isWaiter, isAdmin, isManager } = usePermissions();
  const { archivingInProgress, handleManualArchive } = useArchive(() => handleRefresh());
  
  // Check permissions
  const canViewTables = hasPermission('tables.view');
  const canCreateOrders = hasPermission('orders.create');
  const canViewArchived = hasPermission('orders.view_archived');
  const canArchiveOrders = hasPermission('orders.archive');
  
  // Update URL when showArchived changes
  const handleToggleArchived = (value: boolean) => {
    console.log('Toggling archived view:', value);
    setShowArchived(value);
    
    // Update URL using navigate instead of setSearchParams
    const newUrl = value 
      ? '/orders?archived=true'
      : '/orders';
      
    navigate(newUrl, { replace: true });
    
    // Force refresh the order list
    setRefreshKey(prev => prev + 1);
  };
  
  const handleOrderComplete = () => {
    console.log('Order completed in Orders page');
    handleRefresh();
    toast.success('Orden creada exitosamente');
  };
  
  const handleRefresh = () => {
    console.log('Refreshing orders list');
    setRefreshKey(prev => prev + 1);
  };
  
  // Check for order ID in URL params
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
                  navigate(`/orders?id=${order.id}`);
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
  }, [searchParams, navigate]);

  // Render specific view for waiters
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

  // Standard orders view for other roles
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

              {canArchiveOrders && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleManualArchive}
                  disabled={archivingInProgress}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  {archivingInProgress ? 'Archivando...' : 'Archivar antiguas'}
                </Button>
              )}

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
              key={`orders-list-${refreshKey}-${showArchived ? 'archived' : 'active'}`}
              limit={20} 
              onRefresh={handleRefresh}
              showArchived={showArchived}
              onToggleArchived={handleToggleArchived}
            />
          </div>
        </div>
      </OrderPrintController>
    </Layout>
  );
};

export default Orders;
