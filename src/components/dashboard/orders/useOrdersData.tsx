
import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types/order.types';
import { getOrders, subscribeToOrders, subscribeToFilteredOrders, updateOrderStatus } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { safeArray } from '@/utils/safetyUtils';
import { toast } from 'sonner';

type OrderStatusUI = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'all';

interface UseOrdersDataProps {
  filter?: OrderStatusUI;
  searchQuery?: string;
  limit?: number;
  onRefresh?: () => void;
}

export function useOrdersData({
  filter = 'all',
  searchQuery = '',
  limit = 10,
  onRefresh
}: UseOrdersDataProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadOrders = useCallback(async () => {
    console.log('🔍 [useOrdersData] Starting to load orders...');
    setLoading(true);
    try {
      console.log(`🔍 [useOrdersData] Calling getOrders with filter: ${filter}`);
      const data = await getOrders();
      console.log(`✅ [useOrdersData] Received orders data, length:`, data?.length || 0);
      if (data && data.length > 0) {
        console.log(`✅ [useOrdersData] Sample order:`, data[0]);
      } else {
        console.log(`✅ [useOrdersData] No orders found`);
      }
      
      setOrders(safeArray(data));
    } catch (error) {
      console.error('❌ [useOrdersData] Error loading orders:', error);
      console.error('❌ [useOrdersData] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      console.log('✅ [useOrdersData] Setting loading state to false');
      setLoading(false);
    }
  }, [filter, toast]);

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 [useOrdersData] Updating order ${orderId} status to ${newStatus}`);
      setLoading(true);
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        console.log(`✅ [useOrdersData] Successfully updated order status`);
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
        console.error(`❌ [useOrdersData] Failed to update order status`);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la orden",
          variant: "destructive"
        });
      }
      
      await loadOrders();
      if (onRefresh) {
        console.log(`🔄 [useOrdersData] Calling onRefresh callback`);
        onRefresh();
      }
    } catch (error) {
      console.error('❌ [useOrdersData] Error updating order status:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para carga inicial y suscripción a tiempo real
  useEffect(() => {
    console.log('🔄 [useOrdersData] useEffect triggered, loading orders...');
    loadOrders();
    
    try {
      console.log('🔄 [useOrdersData] Setting up realtime subscription...');
      
      // Usar suscripción filtrada si hay un filtro activo que no sea 'all'
      const unsubscribe = filter !== 'all' 
        ? subscribeToFilteredOrders(filter, handleRealtimeUpdate)
        : subscribeToOrders(handleRealtimeUpdate);
      
      // Función para manejar las actualizaciones en tiempo real
      function handleRealtimeUpdate(payload: any) {
        console.log('✅ [useOrdersData] Realtime order update received:', payload);
        // Recargar órdenes para obtener datos actualizados
        loadOrders();
        
        // Notificación cuando se crea una nueva orden
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new;
          toast({
            title: "Nueva orden recibida",
            description: `Cliente: ${newOrder.customer_name} - Mesa: ${newOrder.table_number || 'Delivery'}`,
          });
        }
      }
      
      return () => {
        console.log('🔄 [useOrdersData] Cleaning up realtime subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [useOrdersData] Error setting up realtime subscription:', error);
      toast.error("Error al conectar con actualizaciones en tiempo real");
    }
  }, [filter, loadOrders]);

  const filteredOrders = orders
    .filter(order => {
      console.log(`🔍 [useOrdersData] Filtering order ${order.id} with status ${order.status}, comparing to filter ${filter}`);
      
      if (filter !== 'all' && order.status !== filter) {
        console.log(`🔍 [useOrdersData] Order ${order.id} filtered out due to status mismatch`);
        return false;
      }
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const orderIdMatch = order.id?.toLowerCase().includes(searchLower);
        const tableMatch = order.table_number?.toString().includes(searchLower);
        const customerMatch = order.customer_name.toLowerCase().includes(searchLower);
        const externalIdMatch = order.external_id?.toLowerCase().includes(searchLower);
        const match = orderIdMatch || tableMatch || customerMatch || externalIdMatch;
        
        console.log(`🔍 [useOrdersData] Order ${order.id} search match: ${match}`);
        return match;
      }
      
      return true;
    })
    .slice(0, limit);
  
  console.log(`🔍 [useOrdersData] Filtered orders length: ${filteredOrders.length}`);
  
  return {
    orders: filteredOrders,
    loading,
    handleOrderStatusChange,
    loadOrders
  };
}
