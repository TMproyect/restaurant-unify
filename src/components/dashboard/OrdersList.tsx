
import React, { useState } from 'react';
import { useOrdersData } from './orders/useOrdersData';
import OrdersListHeader from './orders/OrdersListHeader';
import OrderTableRow from './orders/OrderTableRow';
import LoadingState from './orders/LoadingState';
import EmptyOrdersState from './orders/EmptyOrdersState';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type OrderStatusUI = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'archived' | 'all';

interface OrdersListProps {
  filter?: OrderStatusUI;
  limit?: number;
  onRefresh?: () => void;
  searchQuery?: string;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  filter = 'all',
  limit = 10,
  onRefresh,
  searchQuery = ''
}) => {
  console.log('🔄 [OrdersList] Component rendering with filter:', filter, 'and limit:', limit);
  const [showArchived, setShowArchived] = useState(false);
  
  const { 
    orders: filteredOrders,
    loading,
    handleOrderStatusChange
  } = useOrdersData({
    filter,
    searchQuery,
    limit,
    onRefresh,
    includeArchived: showArchived
  });
  
  return (
    <div className="overflow-hidden">
      <div className="p-2 border-b">
        <Tabs value={showArchived ? "archived" : "active"} onValueChange={(value) => setShowArchived(value === "archived")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Órdenes Activas</TabsTrigger>
            <TabsTrigger value="archived">Órdenes Archivadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
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
