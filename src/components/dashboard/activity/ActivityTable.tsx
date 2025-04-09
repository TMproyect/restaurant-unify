
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import ActionButtons from './ActionButtons';
import StatusBadge from './StatusBadge';
import { ActivityTableProps } from './types';

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
                  {formatTime(new Date(item.timestamp))}
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
                  actions={item.actions.filter(action => !action.startsWith('review-discount'))} 
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

// Format relative time for display
function formatRelativeTime(milliseconds: number): string {
  if (!milliseconds) return 'Ahora';
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// Format time in 12-hour format
function formatTime(date: Date): string {
  return date.toLocaleTimeString('es', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
}

export default ActivityTable;
