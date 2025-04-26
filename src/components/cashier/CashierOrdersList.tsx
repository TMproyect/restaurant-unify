
import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, subscribeToFilteredOrders, Order, updateOrderStatus } from '@/services/orderService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface CashierOrdersListProps {
  filter: 'ready' | 'delivered';
  searchQuery: string;
  onSelectOrder: (orderId: string) => void;
  selectedOrderId: string | null;
}

const CashierOrdersList: React.FC<CashierOrdersListProps> = ({ 
  filter, 
  searchQuery, 
  onSelectOrder,
  selectedOrderId
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Debounce function to prevent too many updates
  const debounce = (fn: Function, ms = 300) => {
    let timeoutId: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // Memoize loadOrders to prevent unnecessary rerenders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      console.log(`Loading orders for cashier with filter: ${filter}`);
      const data = await getOrders();
      
      if (!data) {
        throw new Error("No data returned from getOrders");
      }
      
      // Filter relevant orders based on filter
      const filteredOrders = data.filter(order => {
        if (filter === 'ready') {
          return order.status === 'ready';
        } else if (filter === 'delivered') {
          return order.status === 'delivered';
        }
        return false;
      });
      
      setOrders(filteredOrders || []);
      console.log(`Loaded ${filteredOrders?.length || 0} orders for cashier`);
    } catch (error) {
      console.error('Error loading orders for cashier:', error);
      setHasError(true);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  // Debounced version of loadOrders
  const debouncedLoadOrders = useCallback(
    debounce(() => {
      loadOrders();
    }, 300),
    [loadOrders]
  );

  useEffect(() => {
    // Initial load
    loadOrders();
    
    // Subscribe to order changes with improved error handling
    console.log(`Setting up filtered subscription for ${filter} orders`);
    
    // Map UI filter to database status
    const dbFilter = filter === 'ready' ? 'ready' : 'delivered';
    
    const unsubscribe = subscribeToFilteredOrders(dbFilter, (payload) => {
      console.log('Realtime update received in CashierOrdersList:', payload);
      
      // Only reload if we have relevant changes (e.g., status changes)
      if (payload.new && payload.old && payload.new.status === payload.old.status) {
        // If status didn't change, we can optimize by updating just that order
        setOrders(prev => {
          const orderIndex = prev.findIndex(o => o.id === payload.new.id);
          if (orderIndex >= 0) {
            const updatedOrders = [...prev];
            updatedOrders[orderIndex] = payload.new;
            return updatedOrders;
          }
          return prev;
        });
      } else {
        // For other changes like new orders or status changes, reload all
        debouncedLoadOrders();
      }
    });
    
    return () => {
      console.log('Cleaning up subscription in CashierOrdersList');
      unsubscribe();
    };
  }, [filter, loadOrders, debouncedLoadOrders]);

  // Filter orders based on search query
  const filteredOrders = orders
    .filter(order => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const orderIdMatch = order.id?.toLowerCase().includes(searchLower);
        const tableMatch = order.table_number?.toString().includes(searchLower);
        const customerMatch = order.customer_name.toLowerCase().includes(searchLower);
        return orderIdMatch || tableMatch || customerMatch;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by creation date (most recent first)
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Cargando órdenes...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
          <h3 className="text-red-800 font-medium mb-2">Error al cargar órdenes</h3>
          <p className="text-red-600 text-sm">
            No se pudieron cargar las órdenes. Intente nuevamente.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => loadOrders()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        {searchQuery ? (
          <>
            <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No se encontraron órdenes para <strong>"{searchQuery}"</strong></p>
            <p className="text-sm mt-1 text-muted-foreground">Intenta con otra búsqueda</p>
          </>
        ) : (
          <>
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No hay órdenes {filter === 'ready' ? 'listas para cobrar' : 'pagadas'}</p>
            <p className="text-sm mt-1 text-muted-foreground">Las órdenes aparecerán aquí cuando estén listas</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
      {filteredOrders.map((order) => {
        const isSelected = selectedOrderId === order.id;
        const orderDate = order.created_at ? new Date(order.created_at) : new Date();
        const timeAgo = formatDistanceToNow(orderDate, { addSuffix: true, locale: es });
        
        return (
          <div
            key={order.id}
            className={`p-3 rounded-lg transition-colors cursor-pointer ${
              isSelected 
                ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                : 'bg-card hover:bg-accent/50 border border-border'
            }`}
            onClick={() => order.id && onSelectOrder(order.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                order.id && onSelectOrder(order.id);
              }
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-medium">
                  {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`}
                </span>
                <span className="text-xs text-muted-foreground ml-2">#{order.id?.substring(0, 6)}</span>
              </div>
              <Badge 
                variant={order.status === 'ready' ? 'outline' : 'secondary'} 
                className={order.status === 'ready' 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-blue-100 text-blue-800 border-blue-200'
                }
              >
                {order.status === 'ready' 
                  ? 'Listo para Cobrar' 
                  : 'Entregado'
                }
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{order.customer_name}</div>
              <div className="text-sm font-bold flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatCurrency(order.total)}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {timeAgo}
              </div>
              <div className="text-xs">
                {order.items_count} {order.items_count === 1 ? 'ítem' : 'ítems'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default CashierOrdersList;
