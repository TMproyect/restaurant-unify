
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  getOrderWithItems, 
  updateOrderStatus, 
  subscribeToFilteredOrders,
  Order 
} from '@/services/orderService';
import { mapArrayResponse, filterValue } from '@/utils/supabaseHelpers';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getKitchens } from '@/services/orders/orderQueries';

interface OrderItem {
  id: string;
  name: string;
  notes: string;
  quantity: number;
}

export interface OrderDisplay {
  id: string;
  table: string;
  customerName: string;
  time: string;
  kitchenId: string;
  status: string;
  items: OrderItem[];
}

// Kitchen options constants
export const kitchenOptions = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
];

export const useKitchenData = () => {
  const [selectedKitchen, setSelectedKitchen] = useState("main");
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'ready'>('pending');
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
  const loadOrders = async () => {
    if (!hasViewPermission) return;
    
    try {
      setLoading(true);
      console.log(`🔍 [Kitchen] Loading orders for kitchen ${selectedKitchen} with status filter ${orderStatus}`);
      
      // Construir la consulta base - CORREGIDA para evitar el error de status en order_items
      let query = supabase
        .from('orders')
        .select(`
          id,
          table_number,
          customer_name,
          status,
          is_delivery,
          kitchen_id,
          created_at,
          updated_at,
          order_items (
            id,
            name,
            quantity,
            notes
          )
        `)
        .eq('kitchen_id', filterValue(selectedKitchen));
      
      // Agregar filtro de estado si no es 'all'
      if (orderStatus === 'pending') {
        query = query.eq('status', 'pending');
      } else if (orderStatus === 'preparing') {
        query = query.eq('status', 'preparing');
      } else if (orderStatus === 'ready') {
        query = query.in('status', ['ready', 'delivered']);
      }
      
      // Ejecutar la consulta
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [Kitchen] Error loading orders:', error);
        throw error;
      }
      
      console.log(`✅ [Kitchen] Received ${data?.length || 0} orders from Supabase`);
      
      if (!data) {
        setOrders([]);
        return;
      }
      
      // Map and ensure we have data with proper type
      type ExtendedOrder = Order & { order_items: any[] };
      const typedData = mapArrayResponse<ExtendedOrder>(data, 'Failed to map orders for kitchen');
      
      // Formatear las órdenes para el componente
      const formattedOrders: OrderDisplay[] = typedData.map(order => ({
        id: order.id || '',
        table: order.is_delivery ? 'Delivery' : String(order.table_number),
        customerName: order.customer_name,
        time: new Date(order.created_at || '').toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        kitchenId: order.kitchen_id || '',
        status: order.status,
        items: (order.order_items || []).map((item: any) => ({
          name: item.name,
          notes: item.notes || '',
          id: item.id,
          quantity: item.quantity
        }))
      }));
      
      console.log('✅ [Kitchen] Formatted orders:', formattedOrders);
      setOrders(formattedOrders);
    } catch (error) {
      console.error('❌ [Kitchen] Error loading orders:', error);
      toast.error('Error al cargar los pedidos para cocina');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el estado de una orden
  const updateOrderStatusInKitchen = async (orderId: string, newStatus: string) => {
    if (!hasManagePermission) {
      toast.error("No tienes permisos para actualizar el estado de órdenes");
      return;
    }
    
    try {
      console.log(`🔄 [Kitchen] Updating order ${orderId} status to ${newStatus}`);
      setLoading(true);
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        toast.success(`Estado de la orden actualizado a "${
          newStatus === 'pending' ? 'Pendiente' :
          newStatus === 'preparing' ? 'En preparación' :
          newStatus === 'ready' ? 'Lista' :
          newStatus === 'delivered' ? 'Entregada' :
          newStatus === 'cancelled' ? 'Cancelada' : newStatus
        }"`);
        
        // Recargar órdenes para reflejar el cambio
        loadOrders();
      } else {
        console.error('❌ [Kitchen] Failed to update order status');
        toast.error("No se pudo actualizar el estado de la orden");
      }
    } catch (error) {
      console.error('❌ [Kitchen] Error updating order status:', error);
      toast.error("Ocurrió un error al actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  // Get statistics for the selected kitchen
  const getKitchenStats = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const preparingOrders = orders.filter(order => order.status === 'preparing');
    const completedOrders = orders.filter(order => 
      order.status === 'ready' || order.status === 'delivered'
    );
    
    return { 
      pendingItems: pendingOrders.length, 
      preparingItems: preparingOrders.length, 
      completedItems: completedOrders.length,
      totalItems: orders.length
    };
  };

  // Calculate average preparation time (mock data for demo)
  const getAverageTime = () => {
    // En una app real, esto se calcularía de datos reales
    const times: Record<string, number> = {
      'main': 15,
      'grill': 18,
      'cold': 10,
      'pastry': 20
    };
    
    return times[selectedKitchen] || 15;
  };

  // Get kitchen name from ID
  const getKitchenName = (kitchenId: string) => {
    const kitchen = kitchenOptions.find(k => k.id === kitchenId);
    return kitchen ? kitchen.name : 'Desconocida';
  };

  // Filtrar órdenes por estado
  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (orderStatus === 'pending') {
        return order.status === 'pending';
      } else if (orderStatus === 'preparing') {
        return order.status === 'preparing';
      } else if (orderStatus === 'ready') {
        return order.status === 'ready' || order.status === 'delivered';
      }
      return false;
    });
  };

  // Efecto para cargar órdenes
  useEffect(() => {
    if (!hasViewPermission) {
      console.log('⛔ [Kitchen] Usuario sin permisos para ver la cocina');
      return;
    }
    
    console.log('🔄 [Kitchen] Loading orders for kitchen:', selectedKitchen);
    loadOrders();
    
    // Suscribirse a cambios en órdenes
    try {
      console.log('🔄 [Kitchen] Setting up realtime subscription...');
      
      // Usar suscripción filtrada si hay un filtro activo para la cocina
      const unsubscribe = subscribeToFilteredOrders(orderStatus, handleRealtimeUpdate);
      
      // Función para manejar las actualizaciones en tiempo real
      function handleRealtimeUpdate(payload: any) {
        console.log('✅ [Kitchen] Realtime order update received:', payload);
        
        // Verificar si la orden es para esta cocina
        const order = payload.new;
        if (order && order.kitchen_id === selectedKitchen) {
          console.log('✅ [Kitchen] Order is for this kitchen:', selectedKitchen);
          
          // Notificación cuando se crea una nueva orden
          if (payload.eventType === 'INSERT') {
            toast.success(`Nueva orden recibida: ${order.customer_name} - Mesa: ${order.table_number || 'Delivery'}`, {
              duration: 5000,
            });
          }
          
          // Recargar órdenes para obtener datos actualizados
          loadOrders();
        } else {
          console.log('ℹ️ [Kitchen] Order is not for this kitchen or status filter');
        }
      }
      
      return () => {
        console.log('🔄 [Kitchen] Cleaning up realtime subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [Kitchen] Error setting up realtime subscription:', error);
      toast.error("Error al conectar con actualizaciones en tiempo real");
    }
  }, [selectedKitchen, orderStatus, refreshKey, hasViewPermission]);

  return {
    selectedKitchen,
    setSelectedKitchen,
    orderStatus,
    setOrderStatus,
    orders: getFilteredOrders(),
    loading,
    handleRefresh,
    hasViewPermission,
    hasManagePermission,
    getKitchenStats,
    getAverageTime,
    getKitchenName,
    updateOrderStatusInKitchen
  };
};
