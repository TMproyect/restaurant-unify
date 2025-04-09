
import React from 'react';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import ActionButtons from './ActionButtons';

interface ActivityTableProps {
  filteredItems: ActivityMonitorItem[];
  onActionClick?: (action: string) => void;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ filteredItems, onActionClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-muted-foreground font-medium border-b">
            <th className="text-left py-2 px-3">Orden</th>
            <th className="text-left py-2 px-3">Cliente</th>
            <th className="text-left py-2 px-3">Estado</th>
            <th className="text-left py-2 px-3">Área</th>
            <th className="text-center py-2 px-3">Hora</th>
            <th className="text-right py-2 px-3">Total</th>
            <th className="text-center py-2 px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/30">
              <td className="py-2 px-3">
                <div className="font-medium text-sm">#{item.id.substring(0, 6)}</div>
                <div className="text-xs text-muted-foreground">{item.itemsCount} item(s)</div>
              </td>
              <td className="py-2 px-3 text-sm">{item.customer}</td>
              <td className="py-2 px-3">
                <StatusBadge status={item.status} isDelayed={item.isDelayed} />
              </td>
              <td className="py-2 px-3 text-sm">
                {item.kitchenId ? (
                  <Badge variant="outline" className="bg-secondary/40 text-secondary-foreground">
                    {getKitchenName(item.kitchenId)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">Sin asignar</span>
                )}
              </td>
              <td className="py-2 px-3 text-center">
                <div className="text-xs">
                  {formatRelativeTime(item.timeElapsed)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </td>
              <td className="py-2 px-3 text-right">
                <div className="font-medium text-sm">{formatCurrency(item.total)}</div>
                {item.hasDiscount && item.discountPercentage !== undefined && (
                  <div className="text-xs text-green-600">
                    Desc: {item.discountPercentage}%
                  </div>
                )}
              </td>
              <td className="py-2 px-3 text-center">
                <ActionButtons 
                  actions={item.actions} 
                  onActionClick={onActionClick} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper to display the kitchen name based on kitchen ID
function getKitchenName(kitchenId: string): string {
  switch (kitchenId) {
    case 'main':
      return 'Principal';
    case 'bar':
      return 'Bar';
    case 'grill':
      return 'Parrilla';
    case 'cold':
      return 'Cocina Fría';
    case 'pastry':
      return 'Pastelería';
    default:
      return kitchenId;
  }
}

// Status badge component
function StatusBadge({ status, isDelayed }: { status: string; isDelayed: boolean }) {
  let color = 'bg-gray-100 text-gray-800';
  let label = status;
  
  switch (status) {
    case 'pending':
    case 'pendiente':
      color = isDelayed 
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-blue-100 text-blue-800 border-blue-300';
      label = isDelayed ? 'Retrasado' : 'Pendiente';
      break;
    case 'priority-pending':
      color = 'bg-amber-100 text-amber-800 border-amber-300';
      label = 'Prioritario';
      break;
    case 'preparing':
    case 'preparando':
    case 'en preparación':
      color = 'bg-purple-100 text-purple-800 border-purple-300';
      label = 'Preparando';
      break;
    case 'priority-preparing':
      color = 'bg-orange-100 text-orange-800 border-orange-300';
      label = 'Prep. Prio.';
      break;
    case 'ready':
    case 'listo':
    case 'lista':
      color = 'bg-green-100 text-green-800 border-green-300';
      label = 'Listo';
      break;
    case 'delivered':
    case 'entregado':
    case 'entregada':
      color = 'bg-teal-100 text-teal-800 border-teal-300';
      label = 'Entregado';
      break;
    case 'completed':
    case 'completado':
    case 'completada':
      color = 'bg-green-100 text-green-800 border-green-300';
      label = 'Completado';
      break;
    case 'cancelled':
    case 'cancelado':
    case 'cancelada':
      color = 'bg-red-100 text-red-800 border-red-300';
      label = 'Cancelado';
      break;
  }
  
  return (
    <Badge variant="outline" className={`${color}`}>
      {label}
    </Badge>
  );
}

export default ActivityTable;
