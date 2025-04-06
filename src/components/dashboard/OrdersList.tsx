
import React from 'react';
import { useOrdersData } from './orders/useOrdersData';
import OrdersListHeader from './orders/OrdersListHeader';
import OrderTableRow from './orders/OrderTableRow';
import LoadingState from './orders/LoadingState';
import EmptyOrdersState from './orders/EmptyOrdersState';

type OrderStatusUI = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'all';

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
  
  const { 
    orders: filteredOrders,
    loading,
    handleOrderStatusChange
  } = useOrdersData({
    filter,
    searchQuery,
    limit,
    onRefresh
  });
  
  return (
    <div className="overflow-hidden">
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
                  />
                ))
              ) : (
                <EmptyOrdersState searchQuery={searchQuery} filter={filter} />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
