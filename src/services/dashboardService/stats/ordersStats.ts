
import { supabase } from '@/integrations/supabase/client';

export const getOrdersStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas de órdenes');
    
    // Get ALL orders to correctly categorize
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('❌ [DashboardService] Error en consulta de órdenes:', ordersError);
      throw ordersError;
    }
    
    if (!ordersData || ordersData.length === 0) {
      console.log('⚠️ [DashboardService] No se encontraron órdenes en la base de datos');
      return {
        activeOrders: 0,
        pendingOrders: 0,
        inPreparationOrders: 0,
        readyOrders: 0,
        completedOrders: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    
    console.log(`✅ [DashboardService] Se encontraron ${ordersData.length} órdenes en total`);
    
    // Asegurarse de que cada orden se clasifica correctamente
    const pendingOrders = ordersData.filter(order => 
      order.status === 'pending' || 
      order.status === 'priority-pending' ||
      order.status === 'pendiente'
    ).length || 0;
    
    const preparingOrders = ordersData.filter(order => 
      order.status === 'preparing' || 
      order.status === 'priority-preparing' ||
      order.status === 'preparando' ||
      order.status === 'en preparación'
    ).length || 0;
    
    const readyOrders = ordersData.filter(order => 
      order.status === 'ready' ||
      order.status === 'listo' ||
      order.status === 'lista'
    ).length || 0;
    
    // Contar correctamente las órdenes completadas o entregadas
    const completedOrders = ordersData.filter(order => 
      order.status === 'completed' || 
      order.status === 'delivered' ||
      order.status === 'entregado' ||
      order.status === 'completado'
    ).length || 0;
    
    console.log(`📊 [DashboardService] Pedidos pendientes: ${pendingOrders}`);
    console.log(`📊 [DashboardService] Pedidos en preparación: ${preparingOrders}`);
    console.log(`📊 [DashboardService] Pedidos listos: ${readyOrders}`);
    console.log(`📊 [DashboardService] Pedidos completados: ${completedOrders}`);
    
    // Solo los pedidos pendientes, en preparación y listos son activos
    const activeOrders = pendingOrders + preparingOrders + readyOrders;
    console.log(`📊 [DashboardService] Total pedidos activos: ${activeOrders}`);
    
    return {
      activeOrders,
      pendingOrders,
      inPreparationOrders: preparingOrders,
      readyOrders,
      completedOrders,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas de órdenes:', error);
    throw error;
  }
};
