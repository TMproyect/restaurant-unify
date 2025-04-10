
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import ActionButtons from './ActionButtons';
import StatusBadge from './StatusBadge';
import { ActivityTableProps } from './types';
import OrderSourceBadge from '@/components/kitchen/OrderSourceBadge';

const ActivityTable: React.FC<ActivityTableProps> = ({ filteredItems, onActionClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-muted-foreground font-medium border-b">
            <th className="text-left py-2 px-3">Orden</th>
            <th className="text-left py-2 px-3">Cliente</th>
            <th className="text-left py-2 px-3">Estado</th>
            <th className="text-left py-2 px-3">Fuente</th>
            <th className="text-left py-2 px-3">Área</th>
            <th className="text-center py-2 px-3">Hora</th>
            <th className="text-right py-2 px-3">Total</th>
            <th className="text-center py-2 px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => {
            // Calculate if this is a delayed order (for row highlighting)
            const isDelayed = item.isDelayed;
            const hasCancellation = item.hasCancellation;
            const hasHighDiscount = item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15;
            const isException = isDelayed || hasCancellation || hasHighDiscount;
            
            // Determine row styling based on exceptions
            const rowClassName = `border-b hover:bg-muted/30 ${
              isDelayed ? 'bg-amber-50' : 
              hasCancellation ? 'bg-red-50' : 
              hasHighDiscount ? 'bg-green-50' : ''
            }`;
            
            // Log exception details for debugging
            if (isException) {
              console.log(`📊 [ActivityTable] Exception order ${item.id.substring(0, 6)}: ` + 
                `delayed=${isDelayed}, cancelled=${hasCancellation}, highDiscount=${hasHighDiscount}`);
            }
            
            // Ensure the source value conforms to the expected type
            const orderSource = (item.orderSource || 'pos') as 'pos' | 'delivery' | 'qr_table';
            
            return (
              <tr key={item.id} className={rowClassName}>
                <td className="py-2 px-3">
                  <div className="font-medium text-sm">#{item.id.substring(0, 6)}</div>
                  <div className="text-xs text-muted-foreground">{item.itemsCount} item(s)</div>
                </td>
                <td className="py-2 px-3 text-sm">{item.customer}</td>
                <td className="py-2 px-3">
                  <StatusBadge status={item.status} isDelayed={item.isDelayed} />
                </td>
                <td className="py-2 px-3">
                  <OrderSourceBadge source={orderSource} />
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
                  <div className={`text-xs ${isDelayed ? 'font-bold text-amber-700' : ''}`}>
                    {formatRelativeTime(item.timeElapsed)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(new Date(item.timestamp))}
                  </div>
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="font-medium text-sm">{formatCurrency(item.total)}</div>
                  {item.hasDiscount && item.discountPercentage !== undefined && (
                    <div className={`text-xs ${item.discountPercentage >= 15 ? 'font-bold text-green-600' : 'text-green-600'}`}>
                      Desc: {item.discountPercentage}%
                    </div>
                  )}
                </td>
                <td className="py-2 px-3">
                  <ActionButtons 
                    actions={getContextualActions(item)} 
                    onActionClick={onActionClick} 
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Helper to get contextual actions based on order state
function getContextualActions(item: ActivityMonitorItem): string[] {
  // Start with view action which is always available
  const actions: string[] = [`view:${item.id}`];
  
  // Add status-specific actions
  const status = item.status.toLowerCase();
  
  // CORRECCIÓN: Acciones contextuales específicas por estado
  if (status === 'pending' || status === 'pendiente' || 
      status === 'priority-pending' || status === 'preparing' || 
      status === 'preparando' || status === 'priority-preparing' || 
      status === 'en preparación') {
    // For pending/preparing orders, offer prioritize action
    actions.push(`prioritize:${item.id}`);
  }
  
  if (status === 'cancelled' || status === 'cancelado' || status === 'cancelada') {
    // For cancelled orders, offer review-cancel action
    actions.push(`review-cancel:${item.id}`);
  }
  
  // Acción para revisar descuentos altos
  if (item.hasDiscount && item.discountPercentage && item.discountPercentage >= 15) {
    actions.push(`review-discount:${item.id}`);
  }
  
  if (status === 'ready' || status === 'listo' || status === 'lista' || 
      status === 'completed' || status === 'completado' || 
      status === 'delivered' || status === 'entregado') {
    // For completed/ready orders, offer view-receipt action
    actions.push(`view-receipt:${item.id}`);
  }
  
  return actions;
}

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

// Format relative time for display with more precise formatting
function formatRelativeTime(milliseconds: number): string {
  if (!milliseconds) return 'Ahora';
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
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
