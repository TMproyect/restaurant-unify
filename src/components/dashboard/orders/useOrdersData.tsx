
import { useState, useEffect, useCallback, useRef } from 'react';
import { Order } from '@/types/order.types';
import { getOrders, subscribeToOrders, subscribeToFilteredOrders, updateOrderStatus } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { safeArray } from '@/utils/safetyUtils';
import { toast } from 'sonner';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';
import { usePermissions } from '@/hooks/use-permissions';
import { setupAutoArchiving } from '@/services/dashboardService/activity/autoArchive';

type OrderStatusUI = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'archived' | 'all';

interface UseOrdersDataProps {
  filter?: OrderStatusUI;
  searchQuery?: string;
  limit?: number;
  onRefresh?: () => void;
  includeArchived?: boolean;
}

export function useOrdersData({
  filter = 'all',
  searchQuery = '',
  limit = 10,
  onRefresh,
  includeArchived = false
}: UseOrdersDataProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast: uiToast } = useToast();
  const { hasPermission } = usePermissions();
  const archiveCheckRef = useRef<boolean>(false);
  
  // Check permissions
  const canViewArchived = hasPermission('orders.view_archived');
  const canManageOrders = hasPermission('orders.manage');
  const canArchiveOrders = hasPermission('orders.archive');
  const canRestoreArchived = hasPermission('orders.restore_archived');
  
  // Force includeArchived to false if user doesn't have permission
  const effectiveIncludeArchived = includeArchived && canViewArchived;

  // Check auto-archiving status when component mounts
  useEffect(() => {
    const checkAutoArchive = async () => {
      // Only check once per session
      if (archiveCheckRef.current) return;
      
      try {
        const result = await setupAutoArchiving();
        archiveCheckRef.current = true;
        
        if (!result.success) {
          console.warn('Auto-archiving setup check failed:', result.error);
        } else if (result.settings) {
          console.log('Auto-archive settings loaded:', result.settings);
        }
      } catch (error) {
        console.error('Error checking auto-archive status:', error);
      }
    };
    
    // Only run this if user has archive permissions
    if (canArchiveOrders) {
      checkAutoArchive();
    }
  }, [canArchiveOrders]);

  const loadOrders = useCallback(async () => {
    console.log('🔍 [useOrdersData] Starting to load orders...');
    setLoading(true);
    try {
      console.log(`🔍 [useOrdersData] Calling getOrders with filter: ${filter}, includeArchived: ${effectiveIncludeArchived}`);
      const data = await getOrders(effectiveIncludeArchived);
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
      uiToast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      console.log('✅ [useOrdersData] Setting loading state to false');
      setLoading(false);
    }
  }, [filter, uiToast, effectiveIncludeArchived]);

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 [useOrdersData] Updating order ${orderId} status to ${newStatus}`);
      
      // Check permissions first
      if (newStatus === 'archived' && !canArchiveOrders) {
        uiToast({
          title: "Permiso denegado",
          description: "No tienes permisos para archivar órdenes",
          variant: "destructive"
        });
        return;
      }
      
      if (orders.find(o => o.id === orderId)?.status === 'archived' && !canRestoreArchived) {
        uiToast({
          title: "Permiso denegado",
          description: "No tienes permisos para restaurar órdenes archivadas",
          variant: "destructive"
        });
        return;
      }
      
      if (newStatus !== 'archived' && orders.find(o => o.id === orderId)?.status !== 'archived' && !canManageOrders) {
        uiToast({
          title: "Permiso denegado",
          description: "No tienes permisos para cambiar el estado de las órdenes",
          variant: "destructive"
        });
        return;
      }
      
      setLoading(true);
      // Convert the string status to a valid NormalizedOrderStatus
      const normalizedStatus = newStatus as NormalizedOrderStatus;
      const success = await updateOrderStatus(orderId, normalizedStatus);
      
      if (success) {
        console.log(`✅ [useOrdersData] Successfully updated order status`);
        uiToast({
          title: "Estado actualizado",
          description: `La orden ha sido actualizada a "${
            newStatus === 'pending' ? 'Pendiente' :
            newStatus === 'preparing' ? 'En preparación' :
            newStatus === 'ready' ? 'Lista' :
            newStatus === 'delivered' ? 'Entregada' :
            newStatus === 'cancelled' ? 'Cancelada' :
            newStatus === 'archived' ? 'Archivada' : newStatus
          }"`
        });
      } else {
        console.error(`❌ [useOrdersData] Failed to update order status`);
        uiToast({
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
      uiToast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          toast.success(`Nueva orden recibida: ${newOrder.customer_name} - Mesa: ${newOrder.table_number || 'Delivery'}`);
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
  }, [filter, loadOrders, effectiveIncludeArchived]);

  // Apply filters to orders
  const filteredOrders = orders
    .filter(order => {
      console.log(`🔍 [useOrdersData] Filtering order ${order.id} with status ${order.status}, comparing to filter ${filter}`);
      
      // Si estamos mostrando órdenes archivadas, solo mostrar las que tienen status 'archived'
      if (effectiveIncludeArchived && order.status !== 'archived') {
        return false;
      }
      
      // Si NO estamos mostrando órdenes archivadas, excluir las que tienen status 'archived'
      if (!effectiveIncludeArchived && order.status === 'archived') {
        return false;
      }
      
      if (filter !== 'all' && order.status !== filter) {
        console.log(`🔍 [useOrdersData] Order ${order.id} filtered out due to status mismatch`);
        return false;
      }
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const orderIdMatch = order.id?.toString().toLowerCase().includes(searchLower);
        const tableMatch = order.table_number?.toString().includes(searchLower);
        const customerMatch = order.customer_name?.toLowerCase().includes(searchLower) || false;
        const externalIdMatch = order.external_id?.toLowerCase().includes(searchLower) || false;
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
    loadOrders,
    canViewArchived,
    canArchiveOrders,
    canRestoreArchived,
    canManageOrders
  };
}
