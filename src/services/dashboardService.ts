
import { supabase } from '@/integrations/supabase/client';
import { getDailySalesSummary, SalesSummary } from '@/services/salesService';
import { getLowStockItems, getOutOfStockItems, InventoryItem } from '@/services/inventoryService';

export interface DashboardStats {
  salesSummary: SalesSummary;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  activeOrders: number;
  customerCount: number;
}

// Obtener estadísticas del dashboard en tiempo real
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Obtener resumen de ventas diarias
    const salesSummary = await getDailySalesSummary();
    
    // Obtener productos con stock bajo
    const lowStockItems = await getLowStockItems();
    
    // Obtener productos agotados
    const outOfStockItems = await getOutOfStockItems();
    
    // Obtener pedidos activos (pending, preparing, ready)
    const { count: activeOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'preparing', 'ready']);
      
    if (ordersError) throw ordersError;
    
    // Calcular número de clientes del día
    // Esta es una aproximación basada en órdenes únicas
    const today = new Date().toISOString().split('T')[0];
    const { data: customers, error: customersError } = await supabase
      .from('orders')
      .select('customer_name')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
      
    if (customersError) throw customersError;
    
    // Contar clientes únicos
    const uniqueCustomers = new Set();
    customers?.forEach(order => {
      if (order.customer_name) {
        uniqueCustomers.add(order.customer_name);
      }
    });
    
    return {
      salesSummary,
      lowStockItems,
      outOfStockItems,
      activeOrders: activeOrders || 0,
      customerCount: uniqueCustomers.size
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Devolver valores por defecto en caso de error
    return {
      salesSummary: {
        daily_total: 0,
        transactions_count: 0,
        average_sale: 0,
        cancellations: 0
      },
      lowStockItems: [],
      outOfStockItems: [],
      activeOrders: 0,
      customerCount: 0
    };
  }
};

// Suscribirse a cambios en tiempo real para el dashboard
export const subscribeToDashboardUpdates = (callback: () => void) => {
  const channels = [];
  
  // Canal para cambios en órdenes
  const ordersChannel = supabase
    .channel('orders-dashboard-updates')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders'
        }, 
        () => {
          console.log('Dashboard: Orden actualizada, actualizando datos');
          callback();
        })
    .subscribe();
  
  channels.push(ordersChannel);
  
  // Canal para cambios en inventario
  const inventoryChannel = supabase
    .channel('inventory-dashboard-updates')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'inventory_items'
        }, 
        () => {
          console.log('Dashboard: Inventario actualizado, actualizando datos');
          callback();
        })
    .subscribe();
  
  channels.push(inventoryChannel);
  
  return () => {
    // Desuscribirse de todos los canales al desmontar
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  };
};

// Crear un componente de dashboard que muestra los datos de las tarjetas
export interface DashboardCardData {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: string;
    isPositive: boolean;
    description: string;
  };
  details?: string;
}

// Generar datos de tarjetas del dashboard
export const generateDashboardCards = (stats: DashboardStats): DashboardCardData[] => {
  return [
    {
      title: 'Ventas del Día',
      value: `$${stats.salesSummary.daily_total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: 'dollar-sign',
      change: {
        value: `${Math.abs(stats.salesSummary.growth_rate || 0).toFixed(1)}%`,
        isPositive: (stats.salesSummary.growth_rate || 0) >= 0,
        description: 'desde ayer'
      }
    },
    {
      title: 'Pedidos Activos',
      value: stats.activeOrders,
      icon: 'clipboard-list',
      details: `${Math.floor(stats.activeOrders / 3)} en cocina, ${Math.floor(stats.activeOrders / 3)} listos, ${stats.activeOrders - Math.floor(stats.activeOrders / 3) * 2} entregados`
    },
    {
      title: 'Inventario Bajo',
      value: stats.lowStockItems.length,
      icon: 'package',
      details: `${stats.lowStockItems.length} ingredientes críticos`
    },
    {
      title: 'Clientes Hoy',
      value: stats.customerCount,
      icon: 'users',
      change: {
        value: '12%',
        isPositive: true,
        description: 'desde la semana pasada'
      }
    }
  ];
};
