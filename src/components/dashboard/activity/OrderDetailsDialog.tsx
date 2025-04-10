
import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Check, X, Clock, AlertCircle, FileText } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import OrderSourceBadge from '@/components/kitchen/OrderSourceBadge';

interface OrderDetailsDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ 
  order, 
  isOpen, 
  onClose 
}) => {
  if (!order) return null;
  
  // Calculate tax, service and subtotal
  const subtotal = order.items?.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0) || order.total || 0;
  
  const taxRate = 0.18;
  const serviceRate = 0.10;
  const taxAmount = subtotal * taxRate;
  const serviceAmount = subtotal * serviceRate;
  
  // Calculate discount
  const discountAmount = order.discount || 0;
  const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  
  // Calculate total
  const total = subtotal + taxAmount + serviceAmount - discountAmount;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles de Orden #{order.id?.substring(0, 6)}</span>
            <OrderSourceBadge source={order.order_source} />
          </DialogTitle>
          <DialogDescription className="flex flex-col space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">Cliente:</span> {order.customer_name}
              </div>
              <div>
                <span className="text-muted-foreground">Creada:</span> {formatDate(order.created_at)}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">Mesa:</span> {order.table_number || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>{' '}
                <span className={
                  order.status === 'cancelled' ? 'text-red-600 font-medium' : 
                  order.status === 'completed' ? 'text-green-600 font-medium' : 
                  'font-medium'
                }>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            
            {/* CORRECCIÓN: Mostrar notas generales del pedido si existen */}
            {order.general_notes && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Notas generales del pedido:</p>
                    <p className="text-sm text-amber-800">{order.general_notes}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.notes && (
                      <div className="text-xs text-muted-foreground">{item.notes}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>IVA (18%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Servicio (10%)</span>
              <span>{formatCurrency(serviceAmount)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Descuento ({discountPercentage.toFixed(0)}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getStatusText(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'pendiente':
      return 'Pendiente';
    case 'priority-pending':
      return 'Pendiente (Prioritario)';
    case 'preparing':
    case 'preparando':
    case 'en preparación':
      return 'En Preparación';
    case 'priority-preparing':
      return 'En Preparación (Prioritario)';
    case 'ready':
    case 'listo':
    case 'lista':
      return 'Listo para entregar';
    case 'completed':
    case 'completado':
    case 'delivered':
    case 'entregado':
      return 'Completado';
    case 'cancelled':
    case 'cancelado':
    case 'cancelada':
      return 'Cancelado';
    default:
      return status || 'Desconocido';
  }
}

export default OrderDetailsDialog;
