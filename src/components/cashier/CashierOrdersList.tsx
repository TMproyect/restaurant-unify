
import React, { useState, useEffect } from 'react';
import { getOrders, subscribeToOrders, Order, updateOrderStatus } from '@/services/orderService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const { toast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log(`Loading orders for cashier with filter: ${filter}`);
      const data = await getOrders();
      
      // Filter relevant orders (ready or delivered)
      const filteredOrders = data.filter(order => 
        order.status === 'ready' || order.status === 'delivered'
      );
      
      setOrders(filteredOrders || []);
      console.log(`Loaded ${filteredOrders?.length || 0} orders for cashier`);
    } catch (error) {
      console.error('Error loading orders for cashier:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    
    // Subscribe to order changes with improved logging
    const unsubscribe = subscribeToOrders((payload) => {
      console.log('Realtime order update received in CashierOrdersList:', payload);
      // Always reload to ensure we have the latest data
      loadOrders();
    });
    
    return () => {
      unsubscribe();
    };
  }, [filter]);

  // Filter orders based on search query and status
  const filteredOrders = orders
    .filter(order => {
      // Filter by status
      if (order.status !== filter) return false;
      
      // Filter by search query
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
            <p className="text-muted-foreground">No hay órdenes {filter === 'ready' ? 'listas para cobrar' : 'entregadas'}</p>
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
                ? 'bg-primary/10 border border-primary/30' 
                : 'bg-card hover:bg-accent/50 border border-border'
            }`}
            onClick={() => onSelectOrder(order.id || '')}
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
                  : 'bg-gray-100 text-gray-800 border-gray-200'
                }
              >
                {order.status === 'ready' ? 'Listo para Cobrar' : 'Entregado'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{order.customer_name}</div>
              <div className="text-sm font-bold">${order.total.toFixed(2)}</div>
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
