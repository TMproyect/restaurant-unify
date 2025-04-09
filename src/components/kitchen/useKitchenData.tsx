import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subscribeToOrders } from '@/services/orders/orderSubscriptions';
import { useAuth } from '@/contexts/auth/AuthContext';
import { OrderDisplay, KITCHEN_OPTIONS } from './kitchenTypes';
import { 
  normalizeOrderStatus, 
  getDBStatusesFromUIStatus, 
  NormalizedOrderStatus
} from '@/utils/orderStatusUtils';
import { 
  loadKitchenOrders, 
  updateOrderStatusInKitchen,
  getKitchenName,
  getAveragePreparationTime
} from '@/services/kitchen/kitchenService';
import {
  calculateKitchenStats,
  filterOrdersByStatus
} from '@/services/kitchen/kitchenStatsService';

export { KITCHEN_OPTIONS as kitchenOptions };

// Define the tab status type (a subset of NormalizedOrderStatus)
type KitchenTabStatus = 'pending' | 'preparing' | 'ready';

export const useKitchenData = () => {
  const [selectedKitchen, setSelectedKitchen] = useState("all");  // Mostrar todas las cocinas por defecto
  const [orderStatus, setOrderStatus] = useState<KitchenTabStatus>('pending');
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  
  // Verificar permisos del usuario
  const hasViewPermission = user?.role === 'admin' || 
                            user?.role === 'propietario' ||
                            user?.role === 'gerente' ||
                            user?.role === 'cocina' || 
                            user?.role === 'kitchen';
  
  const hasManagePermission = user?.role === 'admin' || 
                             user?.role === 'propietario' ||
                             user?.role === 'gerente' ||
                             user?.role === 'cocina' || 
                             user?.role === 'kitchen';
  
  // Función para refrescar los datos
  const handleRefresh = () => {
    console.log('🔄 [Kitchen] Refreshing orders list');
    setRefreshKey(prev => prev + 1);
  };

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
      setOrders(data);
    } catch (error) {
      console.error('❌ [Kitchen] Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el estado de una orden
  const updateOrderStatusHandler = async (orderId: string, newStatus: NormalizedOrderStatus) => {
    setLoading(true);
    const success = await updateOrderStatusInKitchen(orderId, newStatus, hasManagePermission);
    
    // Si la actualización fue exitosa, recargar órdenes
    if (success) {
      // Actualizar localmente la orden modificada para mostrar cambio inmediato
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      // Luego recargar todas las órdenes para asegurar sincronización
      setTimeout(() => {
        fetchOrders();
      }, 500);
    } else {
      setLoading(false);
    }
  };

  // Get statistics for the selected kitchen
  const getKitchenStats = () => {
    return calculateKitchenStats(orders);
  };

  // Calculate average preparation time
  const getAverageTime = () => {
    return getAveragePreparationTime(selectedKitchen);
  };

  // Get kitchen name from ID
  const getKitchenNameHandler = (kitchenId: string) => {
    return getKitchenName(kitchenId, KITCHEN_OPTIONS);
  };

  // Filtrar órdenes por estado
  const getFilteredOrders = () => {
    return filterOrdersByStatus(orders, orderStatus);
  };

  // Efecto para cargar órdenes
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

  return {
    selectedKitchen,
    setSelectedKitchen,
    orderStatus,
    setOrderStatus: (status: KitchenTabStatus) => {
      setOrderStatus(status);
    },
    orders: getFilteredOrders(),
    loading,
    handleRefresh,
    hasViewPermission,
    hasManagePermission,
    getKitchenStats,
    getAverageTime,
    getKitchenName: getKitchenNameHandler,
    updateOrderStatusInKitchen: updateOrderStatusHandler
  };
};
