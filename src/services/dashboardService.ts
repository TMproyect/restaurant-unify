
import { supabase } from '@/integrations/supabase/client';

// Define the types for dashboard data
export interface DashboardCardData {
  title: string;
  value: string;
  icon: string;
  change?: {
    value: string;
    isPositive: boolean;
    description: string;
  };
  details?: string;
}

// Función para obtener estadísticas del dashboard
export const getDashboardStats = async () => {
  try {
    console.log('📊 [DashboardService] Obteniendo estadísticas del dashboard');
    
    // Get active orders count
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'in-progress');
    
    if (ordersError) throw ordersError;
    
    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: salesData, error: salesError } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', today.toISOString())
      .eq('status', 'completed');
    
    if (salesError) throw salesError;
    
    const totalSales = salesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    
    // Get customer count for today
    const { count: customersCount, error: customersError } = await supabase
      .from('orders')
      .select('customer_name', { count: 'exact' })
      .gte('created_at', today.toISOString());
    
    if (customersError) throw customersError;
    
    return {
      ordersActive: ordersData?.length || 0,
      salesTotal: totalSales,
      customersToday: customersCount || 0
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al obtener estadísticas:', error);
    throw error;
  }
};

// Generate dashboard cards based on stats
export const generateDashboardCards = (stats: any): DashboardCardData[] => {
  return [
    {
      title: 'Ventas del Día',
      value: `$${stats.salesTotal.toFixed(2)}`,
      icon: 'dollar-sign',
      change: {
        value: '+4.3%',
        isPositive: true,
        description: 'desde ayer'
      }
    },
    {
      title: 'Pedidos Activos',
      value: `${stats.ordersActive}`,
      icon: 'clipboard-list',
      change: {
        value: '+2',
        isPositive: true,
        description: 'en la última hora'
      }
    },
    {
      title: 'Clientes Hoy',
      value: `${stats.customersToday}`,
      icon: 'users',
      change: {
        value: '+12%',
        isPositive: true,
        description: 'desde la semana pasada'
      }
    },
    {
      title: 'Platos Populares',
      value: '5',
      icon: 'package',
      details: 'Revisa el menú para ver detalles'
    }
  ];
};

// Subscribe to dashboard updates using Supabase realtime
export const subscribeToDashboardUpdates = (callback: () => void) => {
  console.log('🔔 [DashboardService] Configurando suscripción en tiempo real');
  
  // Subscribe to orders table changes
  const channel = supabase
    .channel('dashboard-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' }, 
      () => {
        console.log('🔄 [DashboardService] Cambio detectado en órdenes');
        callback();
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    console.log('🔕 [DashboardService] Cancelando suscripción');
    supabase.removeChannel(channel);
  };
};

// Función para verificar el estado del sistema
export const checkSystemStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .eq('key', 'system_status');
    
    if (error) throw error;
    
    console.log('🔍 [DashboardService] Estado del sistema verificado:', data);
    
    return {
      status: data && data.length > 0 ? data[0].value : 'online',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [DashboardService] Error al verificar estado del sistema:', error);
    return {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
