
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getOrders, subscribeToOrders, Order, updateOrderStatus } from '@/services/orderService';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define order status types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

// Status badge component
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    preparing: {
      label: 'En preparación',
      classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    ready: {
      label: 'Listo',
      classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    delivered: {
      label: 'Entregado',
      classes: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
    cancelled: {
      label: 'Cancelado',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const { label, classes } = statusConfig[status];

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', classes)}>
      {label}
    </span>
  );
};

interface OrdersListProps {
  filter?: 'all' | 'table' | 'delivery';
  limit?: number;
  onRefresh?: () => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  filter = 'all',
  limit = 10,
  onRefresh
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Cargar órdenes
  const loadOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data || []);
    setLoading(false);
  };
  
  useEffect(() => {
    loadOrders();
    
    // Suscribirse a cambios en órdenes
    const unsubscribe = subscribeToOrders((payload) => {
      console.log('Realtime order update:', payload);
      loadOrders();
      
      if (payload.eventType === 'INSERT') {
        toast({
          title: "Nueva orden",
          description: `Se ha recibido una nueva orden #${payload.new.id?.substring(0, 4) || ''}`
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Actualizar una orden
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrders();
    if (onRefresh) onRefresh();
  };
  
  // Filtrar órdenes basado en filter type
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'table') return !order.is_delivery;
    if (filter === 'delivery') return order.is_delivery;
    return true;
  }).slice(0, limit);
  
  return (
    <div className="overflow-hidden">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Pedido
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Cliente
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Estado
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Cocina
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Total
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Hora
              </th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr 
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="font-medium">#{order.id?.substring(0, 4)}</div>
                    <div className="text-muted-foreground">
                      {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {order.customer_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <StatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="px-2 py-1 bg-secondary/40 rounded text-xs">
                      {order.kitchen_id || 'Sin asignar'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {new Date(order.created_at || '').toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {order.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id!, 'preparing')}>
                            Iniciar preparación
                          </DropdownMenuItem>
                        )}
                        {order.status === 'preparing' && (
                          <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id!, 'ready')}>
                            Marcar como listo
                          </DropdownMenuItem>
                        )}
                        {order.status === 'ready' && (
                          <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id!, 'delivered')}>
                            Marcar como entregado
                          </DropdownMenuItem>
                        )}
                        {(order.status === 'pending' || order.status === 'preparing') && (
                          <DropdownMenuItem onClick={() => handleOrderStatusChange(order.id!, 'cancelled')}>
                            Cancelar pedido
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground">
                  No hay órdenes para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersList;
