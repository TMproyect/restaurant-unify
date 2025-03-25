
import React from 'react';
import { cn } from '@/lib/utils';

// Define order status types
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

// Define order type
interface Order {
  id: string;
  table?: string;
  delivery?: boolean;
  customer: string;
  status: OrderStatus;
  items: number;
  total: number;
  time: string;
}

// Sample orders for demo
const SAMPLE_ORDERS: Order[] = [
  {
    id: '45',
    table: '3',
    customer: 'Carlos Mendez',
    status: 'preparing',
    items: 4,
    total: 47.50,
    time: '10:30 AM',
  },
  {
    id: '46',
    table: '5',
    customer: 'Maria Lopez',
    status: 'pending',
    items: 2,
    total: 23.75,
    time: '10:40 AM',
  },
  {
    id: '47',
    delivery: true,
    customer: 'Juan Perez',
    status: 'ready',
    items: 3,
    total: 35.20,
    time: '10:25 AM',
  },
  {
    id: '44',
    table: '2',
    customer: 'Sofia Reyes',
    status: 'delivered',
    items: 5,
    total: 68.90,
    time: '10:15 AM',
  },
];

// Status badge component
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    preparing: {
      label: 'En preparación',
      classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    ready: {
      label: 'Listo',
      classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    delivered: {
      label: 'Entregado',
      classes: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
    cancelled: {
      label: 'Cancelado',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const { label, classes } = statusConfig[status];

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', classes)}>
      {label}
    </span>
  );
};

interface OrdersListProps {
  filter?: 'all' | 'table' | 'delivery';
  limit?: number;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  filter = 'all',
  limit = 10
}) => {
  // Filter orders based on filter type
  const filteredOrders = SAMPLE_ORDERS.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'table') return !!order.table;
    if (filter === 'delivery') return !!order.delivery;
    return true;
  }).slice(0, limit);
  
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
              Pedido
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
              Cliente
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
              Estado
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
              Total
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
              Hora
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredOrders.map((order) => (
            <tr 
              key={order.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <div className="font-medium">#{order.id}</div>
                <div className="text-muted-foreground">
                  {order.table ? `Mesa ${order.table}` : 'Delivery'}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                {order.customer}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <StatusBadge status={order.status} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                ${order.total.toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                {order.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersList;
