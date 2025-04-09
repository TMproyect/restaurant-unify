
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subscribeToOrders } from '@/services/orders/orderSubscriptions';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';
import { loadKitchenOrders } from '@/services/kitchen/kitchenService';
import { OrderDisplay } from '@/components/kitchen/types';
import { getDBStatusesFromUIStatus } from '@/utils/orderStatusUtils';
import { safeGet } from '@/utils/safetyUtils';

export const useKitchenOrders = (
  selectedKitchen: string,
  refreshKey: number,
  hasViewPermission: boolean
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
      
      console.log(`🔍 [Kitchen] Fetching orders with all kitchen statuses: ${allStatuses.join(', ')}`);
      
      const data = await loadKitchenOrders(
        selectedKitchen,
        allStatuses,
        hasViewPermission
      );
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos recibidos no válido');
      }
      
      console.log(`✅ [Kitchen] Fetched ${data.length} orders`);
      
      const ordersWithCreatedAt = data.map(order => {
        if (!order) {
          console.warn('[Kitchen] Orden nula encontrada en los datos');
          return null;
        }
        
        return {
          ...order,
          createdAt: order.createdAt || order.time
        };
      }).filter(Boolean) as OrderDisplay[]; // Remove null values
      
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
  }, [selectedKitchen, refreshKey, hasViewPermission]);

  return { orders, loading, error, fetchOrders };
};
