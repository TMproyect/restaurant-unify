
import React, { useState, useEffect } from 'react';
import { useOrdersData } from './orders/useOrdersData';
import OrdersListHeader from './orders/OrdersListHeader';
import OrderTableRow from './orders/OrderTableRow';
import LoadingState from './orders/LoadingState';
import EmptyOrdersState from './orders/EmptyOrdersState';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/use-permissions';

type OrderStatusUI = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'archived' | 'all';

interface OrdersListProps {
  filter?: OrderStatusUI;
  limit?: number;
  onRefresh?: () => void;
  searchQuery?: string;
  showArchived?: boolean;
  onToggleArchived?: (value: boolean) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  filter = 'all',
  limit = 10,
  onRefresh,
  searchQuery = '',
  showArchived = false,
  onToggleArchived
}) => {
  console.log('🔄 [OrdersList] Component rendering with filter:', filter, 'and limit:', limit, 'showArchived:', showArchived);
  const { hasPermission } = usePermissions();
  const [isViewChanging, setIsViewChanging] = useState(false);
  
  // Check if user has permission to view archived orders
  const canViewArchived = hasPermission('orders.view_archived');
  
  const { 
    orders: filteredOrders,
    loading,
    handleOrderStatusChange
  } = useOrdersData({
    filter,
    searchQuery,
    limit,
    onRefresh,
    includeArchived: showArchived && canViewArchived
  });
  
  // If user doesn't have permission to view archived orders and showArchived is true,
  // reset to showing active orders
  useEffect(() => {
    if (showArchived && !canViewArchived && onToggleArchived) {
      onToggleArchived(false);
    }
  }, [canViewArchived, showArchived, onToggleArchived]);
  
  const handleTabChange = (value: string) => {
    if (onToggleArchived) {
      setIsViewChanging(true);
      // Small delay to show loading state during tab change
      setTimeout(() => {
        onToggleArchived(value === "archived");
        setIsViewChanging(false);
      }, 100);
    }
  };
  
  // Use loading state from data hook or local view changing state
  const isLoading = loading || isViewChanging;
  
  return (
    <div className="overflow-hidden">
      {canViewArchived && (
        <div className="p-2 border-b">
          <Tabs 
            value={showArchived ? "archived" : "active"} 
            onValueChange={handleTabChange}
            defaultValue={showArchived ? "archived" : "active"}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Órdenes Activas</TabsTrigger>
              <TabsTrigger value="archived">Órdenes Archivadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
      
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <OrdersListHeader />
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderTableRow 
                    key={order.id}
                    order={order} 
                    onStatusChange={handleOrderStatusChange}
                    isArchived={showArchived}
                  />
                ))
              ) : (
                <EmptyOrdersState 
                  searchQuery={searchQuery} 
                  filter={filter} 
                  isArchived={showArchived}
                />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
