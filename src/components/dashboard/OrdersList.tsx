
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getOrders, subscribeToOrders, updateOrderStatus } from '@/services/orderService';
import { Order } from '@/types/order.types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type OrderStatusUI = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'all';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string, classes: string }> = {
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

  const { label, classes } = statusConfig[status] || {
    label: status,
    classes: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', classes)}>
      {label}
    </span>
  );
};

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
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const loadOrders = async () => {
    console.log('🔍 [OrdersList] Starting to load orders...');
    setLoading(true);
    try {
      console.log(`🔍 [OrdersList] Calling getOrders with filter: ${filter}`);
      const data = await getOrders();
      console.log(`✅ [OrdersList] Received orders data, length:`, data?.length || 0);
      console.log(`✅ [OrdersList] Sample order:`, data?.[0] || 'No orders');
      
      setOrders(data || []);
    } catch (error) {
      console.error('❌ [OrdersList] Error loading orders:', error);
      console.error('❌ [OrdersList] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      console.log('✅ [OrdersList] Setting loading state to false');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('🔄 [OrdersList] useEffect triggered, loading orders...');
    loadOrders();
    
    try {
      console.log('🔄 [OrdersList] Setting up realtime subscription...');
      const unsubscribe = subscribeToOrders((payload) => {
        console.log('✅ [OrdersList] Realtime order update received:', payload);
        loadOrders();
      });
      
      return () => {
        console.log('🔄 [OrdersList] Cleaning up realtime subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [OrdersList] Error setting up realtime subscription:', error);
    }
  }, [filter]);
  
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 [OrdersList] Updating order ${orderId} status to ${newStatus}`);
      setLoading(true);
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        console.log(`✅ [OrdersList] Successfully updated order status`);
        toast({
          title: "Estado actualizado",
          description: `La orden ha sido actualizada a "${
            newStatus === 'pending' ? 'Pendiente' :
            newStatus === 'preparing' ? 'En preparación' :
            newStatus === 'ready' ? 'Lista' :
            newStatus === 'delivered' ? 'Entregada' :
            newStatus === 'cancelled' ? 'Cancelada' : newStatus
          }"`
        });
      } else {
        console.error(`❌ [OrdersList] Failed to update order status`);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la orden",
          variant: "destructive"
        });
      }
      
      await loadOrders();
      if (onRefresh) {
        console.log(`🔄 [OrdersList] Calling onRefresh callback`);
        onRefresh();
      }
    } catch (error) {
      console.error('❌ [OrdersList] Error updating order status:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  console.log('🔍 [OrdersList] Current orders state length:', orders.length);
  
  const filteredOrders = orders
    .filter(order => {
      console.log(`🔍 [OrdersList] Filtering order ${order.id} with status ${order.status}, comparing to filter ${filter}`);
      
      if (filter !== 'all' && order.status !== filter) {
        console.log(`🔍 [OrdersList] Order ${order.id} filtered out due to status mismatch`);
        return false;
      }
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const orderIdMatch = order.id?.toLowerCase().includes(searchLower);
        const tableMatch = order.table_number?.toString().includes(searchLower);
        const customerMatch = order.customer_name.toLowerCase().includes(searchLower);
        const match = orderIdMatch || tableMatch || customerMatch;
        
        console.log(`🔍 [OrdersList] Order ${order.id} search match: ${match}`);
        return match;
      }
      
      return true;
    })
    .slice(0, limit);
  
  console.log(`🔍 [OrdersList] Filtered orders length: ${filteredOrders.length}`);
  
  return (
    <div className="overflow-hidden">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando órdenes...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                        {order.is_delivery ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            Delivery
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                            Mesa {order.table_number}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {order.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {order.kitchen_id ? (
                        <Badge variant="outline" className="bg-secondary/40 text-secondary-foreground">
                          {order.kitchen_id === 'main' ? 'Principal' : 
                           order.kitchen_id === 'bar' ? 'Bar' : 
                           order.kitchen_id === 'grill' ? 'Parrilla' : 
                           order.kitchen_id}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin asignar</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                      ${order.total.toFixed(2)}
                      {order.discount !== undefined && order.discount > 0 && (
                        <div className="text-xs text-green-600">
                          Descuento: {order.discount}%
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '--:--'}
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
                          <DropdownMenuItem onClick={() => {
                            console.log('View order details for:', order.id);
                            toast({
                              title: "Ver detalles",
                              description: `Detalles de la orden #${order.id?.substring(0, 4)}`
                            });
                          }}>
                            Ver detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    {searchQuery ? (
                      <div className="flex flex-col items-center">
                        <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                        <p>No se encontraron órdenes para <strong>"{searchQuery}"</strong></p>
                        <p className="text-sm mt-1">Intenta con otra búsqueda</p>
                      </div>
                    ) : (
                      <div>
                        <p>No hay órdenes para mostrar.</p>
                        {filter !== 'all' && (
                          <p className="text-sm mt-1">No hay órdenes con estado "{filter}"</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
