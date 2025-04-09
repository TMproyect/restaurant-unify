
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subscribeToOrders } from '@/services/orders/orderSubscriptions';
import { normalizeOrderStatus } from '@/utils/orderStatusUtils';
import { 
  loadKitchenOrders 
} from '@/services/kitchen/kitchenService';
import { OrderDisplay } from '@/components/kitchen/kitchenTypes';
import { getDBStatusesFromUIStatus } from '@/utils/orderStatusUtils';

export const useKitchenOrders = (
  selectedKitchen: string,
  refreshKey: number,
  hasViewPermission: boolean
) => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar órdenes desde Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Obtener estados de DB para todos los estados UI que queremos mostrar
      // Para asegurar que traemos todos los pedidos relevantes
      const pendingDbStatuses = getDBStatusesFromUIStatus('pending');
      const preparingDbStatuses = getDBStatusesFromUIStatus('preparing');
      const readyDbStatuses = getDBStatusesFromUIStatus('ready');
      
      // Unimos todos los estados que nos interesan
      const allStatuses = [...pendingDbStatuses, ...preparingDbStatuses, ...readyDbStatuses];
      
      console.log(`🔍 [Kitchen] Fetching orders with all kitchen statuses: ${allStatuses.join(', ')}`);
      
      // Cargar órdenes
      const data = await loadKitchenOrders(
        selectedKitchen,
        allStatuses,
        hasViewPermission
      );
      
      console.log(`✅ [Kitchen] Fetched ${data.length} orders`);
      
      // Store the raw createdAt date for time calculations
      const ordersWithCreatedAt = data.map(order => ({
        ...order,
        createdAt: order.createdAt || order.time // Ensure we have a createdAt for calculations
      }));
      
      setOrders(ordersWithCreatedAt);
    } catch (error) {
      console.error('❌ [Kitchen] Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup effect for fetching orders
  useEffect(() => {
    if (!hasViewPermission) {
      console.log('⛔ [Kitchen] Usuario sin permisos para ver la cocina');
      return;
    }
    
    console.log('🔄 [Kitchen] Loading orders for kitchen:', selectedKitchen);
    fetchOrders();
    
    // Suscribirse a cambios en órdenes
    try {
      console.log('🔄 [Kitchen] Setting up realtime subscription...');
      
      // Crear una suscripción para todos los eventos
      const unsubscribe = subscribeToOrders((payload) => {
        console.log('✅ [Kitchen] Realtime order update received:', payload);
        
        // Verificar si la orden es para esta cocina
        const order = payload.new || payload.old;
        if (!order) return;
        
        const orderKitchenId = order.kitchen_id || 'main';
        const isForThisKitchen = selectedKitchen === "all" || orderKitchenId === selectedKitchen;
        
        // Normalizar el status para detectar si debemos actualizarlo en la interfaz
        const normalizedStatus = normalizeOrderStatus(order.status || 'pending');
        
        if (isForThisKitchen) {
          console.log('✅ [Kitchen] Order is for this kitchen:', selectedKitchen);
          
          // Notificación cuando se crea una nueva orden
          if (payload.eventType === 'INSERT') {
            toast.success(`Nueva orden recibida: ${order.customer_name} - Mesa: ${order.table_number || 'Delivery'}`, {
              duration: 5000,
            });
          }
          
          // Notificación cuando se actualiza una orden (solo para actualizaciones de estado)
          if (payload.eventType === 'UPDATE' && payload.old && payload.old.status !== order.status) {
            const oldStatus = normalizeOrderStatus(payload.old.status);
            toast.info(`Orden #${order.id.substring(0, 4)} actualizada: ${oldStatus} → ${normalizedStatus}`, {
              duration: 3000,
            });
          }
          
          // Recargar órdenes para obtener datos actualizados
          fetchOrders();
        } else {
          console.log('ℹ️ [Kitchen] Order is not for this kitchen:', orderKitchenId);
        }
      });
      
      return () => {
        console.log('🔄 [Kitchen] Cleaning up realtime subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [Kitchen] Error setting up realtime subscription:', error);
      toast.error("Error al conectar con actualizaciones en tiempo real");
    }
  }, [selectedKitchen, refreshKey, hasViewPermission]);

  return { orders, loading, fetchOrders };
};
