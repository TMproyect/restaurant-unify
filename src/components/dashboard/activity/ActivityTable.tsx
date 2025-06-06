
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import ActionButtons from './ActionButtons';
import StatusBadge from './StatusBadge';
import { ActivityTableProps } from './types';
import OrderSourceBadge from '@/components/kitchen/OrderSourceBadge';
import { Clock, Zap, AlertCircle, Archive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { isOrderArchivable } from './utils/filterUtils';

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
            <th className="text-center py-2 px-3">Tiempo</th>
            <th className="text-center py-2 px-3">Prioridad</th>
            <th className="text-center py-2 px-3">Estado de Tiempo</th>
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
            const isArchivable = isOrderArchivable(item);
            const isException = isDelayed || hasCancellation || hasHighDiscount;
            
            // Enhanced time status calculation
            const timeStatus = getTimeStatus(item);
            
            // Determine row styling based on exceptions
            const rowClassName = `border-b hover:bg-muted/30 ${
              isArchivable ? 'bg-purple-50/50' :
              isDelayed ? 'bg-amber-50' : 
              hasCancellation ? 'bg-red-50' : 
              hasHighDiscount ? 'bg-green-50' : 
              timeStatus.status === 'warning' ? 'bg-yellow-50/50' :
              timeStatus.status === 'critical' ? 'bg-red-50/50' :
              ''
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
                <td className="py-2 px-3 text-center">
                  {item.isPrioritized ? (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <Zap className="h-3 w-3 mr-1" />
                      Priorizado
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Normal</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {timeStatus.status === 'normal' && (
                            <span className="text-xs text-green-600 flex items-center justify-center">
                              <Clock className="h-3 w-3 mr-1" />
                              A tiempo
                            </span>
                          )}
                          {timeStatus.status === 'warning' && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Por vencer
                            </Badge>
                          )}
                          {timeStatus.status === 'critical' && (
                            <Badge variant="destructive" className="flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Atrasado
                            </Badge>
                          )}
                          {timeStatus.status === 'archive-soon' && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 flex items-center">
                              <Archive className="h-3 w-3 mr-1" />
                              Por archivar
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{timeStatus.message}</p>
                        {isArchivable && (
                          <p className="text-xs mt-1 text-purple-600">Esta orden será archivada automáticamente pronto.</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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

// New function to get time status with improved thresholds based on order state
function getTimeStatus(item: ActivityMonitorItem): { status: 'normal' | 'warning' | 'critical' | 'archive-soon', message: string } {
  const minutesElapsed = item.timeElapsed / (1000 * 60);
  const hoursElapsed = minutesElapsed / 60;
  const status = item.status.toLowerCase();
  
  // Check if the order is archivable
  if (isOrderArchivable(item)) {
    return { 
      status: 'archive-soon', 
      message: getArchiveMessage(item) 
    };
  }
  
  // Define thresholds based on order status
  if (status === 'pending' || status === 'pendiente' || status === 'priority-pending') {
    if (minutesElapsed > 20) {
      return { 
        status: 'critical', 
        message: `Pedido pendiente por ${minutesElapsed.toFixed(0)} minutos. Debería ser procesado inmediatamente.` 
      };
    } else if (minutesElapsed > 10) {
      return { 
        status: 'warning', 
        message: `Pedido pendiente por ${minutesElapsed.toFixed(0)} minutos. Se acerca al límite de tiempo.` 
      };
    }
  } 
  else if (status === 'preparing' || status === 'preparando' || status === 'priority-preparing' || status === 'en preparación') {
    if (minutesElapsed > 30) {
      return { 
        status: 'critical', 
        message: `Pedido en preparación por ${minutesElapsed.toFixed(0)} minutos. Ha excedido el tiempo normal de preparación.` 
      };
    } else if (minutesElapsed > 20) {
      return { 
        status: 'warning', 
        message: `Pedido en preparación por ${minutesElapsed.toFixed(0)} minutos. Se acerca al límite de tiempo.` 
      };
    }
  }
  else if (status === 'ready' || status === 'listo' || status === 'lista') {
    if (minutesElapsed > 15) {
      return { 
        status: 'warning', 
        message: `Pedido listo esperando entrega por ${minutesElapsed.toFixed(0)} minutos.` 
      };
    }
  }
  else if (status === 'completed' || status === 'completado' || status === 'entregado' || status === 'delivered') {
    if (hoursElapsed > 20) {
      return { 
        status: 'archive-soon', 
        message: `Este pedido será archivado automáticamente en ${(24 - hoursElapsed).toFixed(1)} horas.` 
      };
    }
  }
  else if (status === 'cancelled' || status === 'cancelado' || status === 'cancelada') {
    if (hoursElapsed > 40) {
      return { 
        status: 'archive-soon', 
        message: `Este pedido será archivado automáticamente en ${(48 - hoursElapsed).toFixed(1)} horas.` 
      };
    }
  }
  
  return { status: 'normal', message: `Tiempo de procesamiento normal.` };
}

// Helper function to generate archive message
function getArchiveMessage(item: ActivityMonitorItem): string {
  const hoursElapsed = item.timeElapsed / (1000 * 60 * 60);
  const status = item.status.toLowerCase();
  
  if (status === 'completed' || status === 'completado' || status === 'entregado' || status === 'delivered') {
    return `Este pedido completado será archivado pronto (superó las 24 horas)`;
  }
  
  if (status === 'cancelled' || status === 'cancelado' || status === 'cancelada') {
    return `Este pedido cancelado será archivado pronto (superó las 48 horas)`;
  }
  
  if ((status === 'pending' || status === 'pendiente' || 
      status === 'preparing' || status === 'preparando' || 
      status === 'en preparación') && hoursElapsed > 12) {
    return `Este pedido inactivo será archivado pronto (posible pedido de prueba)`;
  }
  
  return `Este pedido será archivado pronto`;
}

// Helper to get contextual actions based on order state
function getContextualActions(item: ActivityMonitorItem): string[] {
  // Start with view action which is always available
  const actions: string[] = [`view:${item.id}`];
  
  // Add status-specific actions
  const status = item.status.toLowerCase();
  const isPrioritized = item.isPrioritized;
  
  // CORRECCIÓN: Acciones contextuales específicas por estado
  if ((status === 'pending' || status === 'pendiente' || 
      status === 'preparing' || status === 'preparando' || 
      status === 'en preparación') && !isPrioritized) {
    // For pending/preparing orders, offer prioritize action if not already prioritized
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
