
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subscribeToOrders } from '@/services/orders/orderSubscriptions';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';
import { loadKitchenOrders } from '@/services/kitchen/kitchenService';
import { OrderDisplay } from '@/components/kitchen/types';
import { getDBStatusesFromUIStatus } from '@/utils/orderStatusUtils';
import { safeGet } from '@/utils/safetyUtils';
import { isActiveStatus, isPendingStatus, isPreparingStatus, isReadyStatus } from '@/services/dashboardService/constants/orderStatuses';

export const useKitchenOrders = (
  selectedKitchen: string,
  refreshKey: number,
  hasViewPermission: boolean,
  showOnlyToday: boolean = true
) => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      // Reset error state at the beginning of each fetch
      setError(null);
      setLoading(true);
      
      if (!selectedKitchen) {
        throw new Error('Cocina seleccionada no válida');
      }
      
      const pendingDbStatuses = getDBStatusesFromUIStatus('pending');
      const preparingDbStatuses = getDBStatusesFromUIStatus('preparing');
      const readyDbStatuses = getDBStatusesFromUIStatus('ready');
      
      // Validate that all status arrays contain values
      if (!pendingDbStatuses.length || !preparingDbStatuses.length || !readyDbStatuses.length) {
        console.error('Estado de órdenes no disponible:', { 
          pending: pendingDbStatuses, 
          preparing: preparingDbStatuses, 
          ready: readyDbStatuses 
        });
        throw new Error('Error en estado de órdenes');
      }
      
      const allStatuses = [...pendingDbStatuses, ...preparingDbStatuses, ...readyDbStatuses];
      
      // Add debugging to log raw status arrays
      console.log('🔍 [Kitchen] Status arrays used for filtering:', { 
        pending: pendingDbStatuses, 
        preparing: preparingDbStatuses, 
        ready: readyDbStatuses,
        all: allStatuses 
      });
      
      console.log(`🔍 [Kitchen] Fetching orders with all kitchen statuses: ${allStatuses.join(', ')}`);
      
      // Obtener fecha actual para filtrar
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Pasar el filtro de fecha si showOnlyToday es true
      const data = await loadKitchenOrders(
        selectedKitchen,
        allStatuses,
        hasViewPermission,
        showOnlyToday ? today : undefined
      );
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos recibidos no válido');
      }
      
      console.log(`✅ [Kitchen] Fetched ${data.length} orders`);
      
      // Check for direct discrepancy with dashboard
      const rawStatuses = data.map(o => o.status);
      console.log('🔍 [Kitchen] Raw order statuses:', rawStatuses);
      
      const pendingCount = data.filter(o => isPendingStatus(o.status)).length;
      const preparingCount = data.filter(o => isPreparingStatus(o.status)).length;
      const readyCount = data.filter(o => isReadyStatus(o.status)).length;
      const activeCount = data.filter(o => isActiveStatus(o.status)).length;
      
      console.log('🔍 [Kitchen] Raw status counts:', {
        pendingCount,
        preparingCount,
        readyCount,
        activeCount,
        totalCount: data.length
      });
      
      const ordersWithCreatedAt = data.map(order => {
        if (!order) {
          console.warn('[Kitchen] Orden nula encontrada en los datos');
          return null;
        }
        
        // Add debugging to see how statuses are being normalized
        const originalStatus = order.status;
        const normalizedStatus = normalizeOrderStatus(originalStatus);
        console.log(`🔍 [Kitchen] Order ${order.id}: Original status "${originalStatus}" normalized to "${normalizedStatus}"`);
        
        return {
          ...order,
          createdAt: order.createdAt || order.time,
          status: normalizedStatus
        };
      }).filter(Boolean) as OrderDisplay[]; // Remove null values
      
      // Log normalized order counts by status
      const normalizedPendingCount = ordersWithCreatedAt.filter(o => o.status === 'pending').length;
      const normalizedPreparingCount = ordersWithCreatedAt.filter(o => o.status === 'preparing').length;
      const normalizedReadyCount = ordersWithCreatedAt.filter(o => o.status === 'ready').length;
      
      console.log('🔍 [Kitchen] Normalized status counts:', {
        pendingCount: normalizedPendingCount,
        preparingCount: normalizedPreparingCount,
        readyCount: normalizedReadyCount,
        totalCount: ordersWithCreatedAt.length
      });
      
      setOrders(ordersWithCreatedAt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar órdenes';
      console.error('❌ [Kitchen] Error in fetchOrders:', error);
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasViewPermission) {
      console.log('⛔ [Kitchen] Usuario sin permisos para ver la cocina');
      setError('No tienes permisos para ver esta sección');
      setLoading(false);
      return;
    }
    
    if (!selectedKitchen) {
      console.error('⛔ [Kitchen] Cocina seleccionada no válida');
      setError('Selección de cocina no válida');
      setLoading(false);
      return;
    }
    
    console.log('🔄 [Kitchen] Loading orders for kitchen:', selectedKitchen);
    fetchOrders();
    
    let unsubscribe = () => {};
    
    try {
      console.log('🔄 [Kitchen] Setting up realtime subscription...');
      
      unsubscribe = subscribeToOrders((payload) => {
        // Validate payload
        if (!payload) {
          console.error('❌ [Kitchen] Received invalid payload from realtime subscription');
          return;
        }
        
        console.log('✅ [Kitchen] Realtime order update received:', payload);
        
        const order = payload.new || payload.old;
        if (!order) {
          console.warn('⚠️ [Kitchen] Realtime update missing order data');
          return;
        }
        
        const orderKitchenId = order.kitchen_id || 'main';
        const isForThisKitchen = selectedKitchen === "all" || orderKitchenId === selectedKitchen;
        
        let normalizedStatus = 'pending';
        try {
          normalizedStatus = normalizeOrderStatus(order.status || 'pending');
        } catch (error) {
          console.error('❌ [Kitchen] Error normalizing order status:', error);
        }
        
        if (isForThisKitchen) {
          console.log('✅ [Kitchen] Order is for this kitchen:', selectedKitchen);
          
          if (payload.eventType === 'INSERT') {
            toast.success(`Nueva orden recibida: ${safeGet(order, 'customer_name', 'Cliente')} - Mesa: ${safeGet(order, 'table_number', 'Delivery') || 'Delivery'}`, {
              duration: 5000,
            });
          }
          
          if (payload.eventType === 'UPDATE' && payload.old && payload.old.status !== order.status) {
            try {
              const oldStatus = normalizeOrderStatus(payload.old.status);
              toast.info(`Orden #${order.id.substring(0, 4)} actualizada: ${oldStatus} → ${normalizedStatus}`, {
                duration: 3000,
              });
            } catch (error) {
              console.error('❌ [Kitchen] Error processing status update notification:', error);
            }
          }
          
          fetchOrders();
        } else {
          console.log('ℹ️ [Kitchen] Order is not for this kitchen:', orderKitchenId);
        }
      });
      
    } catch (error) {
      console.error('❌ [Kitchen] Error setting up realtime subscription:', error);
      toast.error("Error al conectar con actualizaciones en tiempo real");
    }
    
    return () => {
      console.log('🔄 [Kitchen] Cleaning up realtime subscription');
      try {
        unsubscribe();
      } catch (cleanupError) {
        console.error('❌ [Kitchen] Error cleaning up subscription:', cleanupError);
      }
    };
  }, [selectedKitchen, refreshKey, hasViewPermission, showOnlyToday]);

  return { orders, loading, error, fetchOrders };
};
