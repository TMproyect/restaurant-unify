
import React from 'react';
import KitchenOrderCard from './KitchenOrderCard';
import { NormalizedOrderStatus, getStatusLabel } from '@/utils/orderStatusUtils';

interface OrderItem {
  id: string;
  name: string;
  notes: string;
  quantity: number;
}

interface OrderDisplay {
  id: string;
  table: string;
  customerName: string;
  time: string;
  kitchenId: string;
  status: NormalizedOrderStatus;
  items: OrderItem[];
  createdAt: string;
  orderSource: 'delivery' | 'qr_table' | 'pos' | null;
}

interface KitchenOrdersGridProps {
  orders: OrderDisplay[];
  orderStatus: NormalizedOrderStatus;
  hasManagePermission: boolean;
  updateOrderStatus: (orderId: string, newStatus: NormalizedOrderStatus) => Promise<void>;
  getKitchenName: (kitchenId: string) => string;
  selectedKitchen: string;
  urgencyThreshold: number;
}

const KitchenOrdersGrid: React.FC<KitchenOrdersGridProps> = ({
  orders,
  orderStatus,
  hasManagePermission,
  updateOrderStatus,
  getKitchenName,
  selectedKitchen,
  urgencyThreshold
}) => {
  // Filtrar órdenes por estado actual para asegurar que solo mostramos las órdenes
  // que corresponden a la pestaña actual
  const filteredOrders = orders.filter(order => order.status === orderStatus);
  
  // Para órdenes pendientes, implementamos ordenamiento especial:
  // 1. Órdenes urgentes primero (si han pasado más de urgencyThreshold minutos)
  // 2. Órdenes FIFO (primero en llegar, primero en salir) con las más antiguas arriba
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const createdAtA = new Date(a.createdAt).getTime();
    const createdAtB = new Date(b.createdAt).getTime();
    
    if (orderStatus === 'pending') {
      const now = new Date().getTime();
      
      // Calcular minutos transcurridos para cada orden
      const minutesPassedA = Math.floor((now - createdAtA) / (1000 * 60)); 
      const minutesPassedB = Math.floor((now - createdAtB) / (1000 * 60));
      
      // Si ambas son urgentes o ninguna es urgente, ordena por FIFO
      const isUrgentA = minutesPassedA >= urgencyThreshold;
      const isUrgentB = minutesPassedB >= urgencyThreshold;
      
      if (isUrgentA && !isUrgentB) {
        return -1; // A (urgente) va primero
      } else if (!isUrgentA && isUrgentB) {
        return 1; // B (urgente) va primero
      }
    }
    
    // FIFO: la orden más antigua primero (compare timestamps)
    return createdAtA - createdAtB;
  });
  
  // Logging para debug
  console.log(`🔄 [KitchenOrdersGrid] Mostrando ${sortedOrders.length} órdenes ${orderStatus}`);
  
  if (sortedOrders.length === 0) {
    return (
      <div className="col-span-2 text-center py-10 text-muted-foreground">
        No hay órdenes <strong>{getStatusLabel(orderStatus).toLowerCase()}</strong> para{' '}
        <strong>{getKitchenName(selectedKitchen)}</strong>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedOrders.map(order => (
        <KitchenOrderCard
          key={order.id}
          order={order}
          kitchenName={getKitchenName(order.kitchenId)}
          orderStatus={orderStatus}
          hasManagePermission={hasManagePermission}
          updateOrderStatus={updateOrderStatus}
          urgencyThreshold={urgencyThreshold}
        />
      ))}
    </div>
  );
};

export default KitchenOrdersGrid;
