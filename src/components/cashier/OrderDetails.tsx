import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Receipt, Edit, ReceiptText, Percent, DollarSign, Printer } from 'lucide-react';
import { Order, OrderItem } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import usePrintService from '@/hooks/use-print-service';
import { toast } from 'sonner';

interface OrderDetailsProps {
  orderDetails: {
    order: Order | null;
    items: OrderItem[];
  } | null;
  isLoading: boolean;
  onPaymentClick: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ 
  orderDetails, 
  isLoading,
  onPaymentClick 
}) => {
  const { order, items } = orderDetails || { order: null, items: [] };
  const { toast } = useToast();
  const { isConnected } = usePrintService();
  
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateDiscount = () => {
    if (!order?.discount) return 0;
    const subtotal = calculateSubtotal();
    return subtotal * (order.discount / 100);
  };
  
  const calculateTax = () => {
    // Assuming 16% tax rate - this should be configurable
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.16; // 16% tax
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const generateTicketContent = () => {
    if (!order) return '';
    
    // Format date in a locale-friendly way
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const formattedDate = new Date().toLocaleDateString('es-MX', dateOptions);
    
    // Initialize content string
    let content = '';
    
    // Header
    content += '\x1B\x61\x01'; // Center align
    content += 'RESTAURANTE DEMO\n';
    content += 'PRE-CUENTA\n\n';
    
    // Left align for details
    content += '\x1B\x61\x00';
    
    // Order info
    content += `Mesa: ${order.table_number}\n`;
    content += `Cliente: ${order.customer_name}\n`;
    content += `Fecha: ${formattedDate}\n`;
    content += `Orden: #${order.id?.substring(0, 6)}\n`;
    content += '--------------------------------\n';
    
    // Column headers
    content += 'DESCRIPCION     CANT  PRECIO  TOTAL\n';
    content += '--------------------------------\n';
    
    // Items
    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      // Format item details with fixed width columns
      const name = item.name.substring(0, 15).padEnd(15);
      const qty = item.quantity.toString().padStart(4);
      const price = item.price.toFixed(2).padStart(6);
      const total = itemTotal.toFixed(2).padStart(6);
      
      content += `${name} ${qty} ${price} ${total}\n`;
      
      // Add notes if available
      if (item.notes) {
        content += `  ${item.notes.substring(0, 28)}\n`;
      }
    });
    
    content += '--------------------------------\n';
    
    // Totals
    const subtotal = calculateSubtotal();
    content += `Subtotal:${subtotal.toFixed(2).padStart(23)}\n`;
    
    if (order.discount && order.discount > 0) {
      const discount = calculateDiscount();
      content += `Descuento (${order.discount}%):${discount.toFixed(2).padStart(14)}\n`;
    }
    
    const tax = calculateTax();
    content += `IVA (16%):${tax.toFixed(2).padStart(24)}\n`;
    
    const total = calculateTotal();
    content += '\x1B\x45\x01'; // Bold on
    content += `TOTAL:${total.toFixed(2).padStart(27)}\n`;
    content += '\x1B\x45\x00'; // Bold off
    
    content += '--------------------------------\n';
    
    // Footer
    content += '\x1B\x61\x01'; // Center align
    content += 'CUENTA PRELIMINAR\n';
    content += 'NO ES COMPROBANTE FISCAL\n';
    content += 'Gracias por su preferencia\n\n';
    
    // Cut command
    content += '\x1D\x56\x00'; // Full cut
    
    return content;
  };

  const handlePrintPreBill = async () => {
    if (!order) return;
    
    console.log('Printing pre-bill for order:', order.id);
    
    // Check if printer is connected before proceeding
    if (!isConnected) {
      toast({
        title: "Error de impresión",
        description: "El sistema de impresión no está conectado. Por favor conecte la impresora primero.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate ticket content
      const ticketContent = generateTicketContent();
      
      // Send to printer service (using a temporary printer name)
      // In a real implementation, this would come from configuration
      const printerName = "IMPRESORA_PRECUENTA";
      
      // Use printService directly through the usePrintService hook
      const success = await window.printService.printRaw(printerName, ticketContent, {
        encoding: 'UTF-8',
        language: 'escpos'
      });
      
      if (success) {
        toast({
          title: "Pre-cuenta enviada a impresora",
          description: `Mesa ${order.table_number} - Cliente: ${order.customer_name}`
        });
      }
    } catch (error) {
      console.error('Error printing pre-bill:', error);
      toast({
        title: "Error al imprimir",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando detalles de la orden...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-1">Ninguna orden seleccionada</h3>
        <p className="text-center text-muted-foreground">
          Selecciona una orden de la lista para ver sus detalles
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium flex items-center">
            <ReceiptText className="mr-2 h-5 w-5 text-primary" />
            Detalles de la Orden
          </h2>
          <div className="text-sm text-muted-foreground">
            {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`} • #{order.id?.substring(0, 6)}
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </div>
      
      <div className="bg-muted/30 p-3 rounded-md mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Cliente:</span>
          <span className="text-sm">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <span className="text-sm">{order.status === 'ready' ? 'Listo para cobrar' : 'Entregado'}</span>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-450px)]">
        <h3 className="font-medium mb-2">Productos</h3>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No hay productos en esta orden</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  {item.notes && (
                    <div className="text-xs text-muted-foreground">{item.notes}</div>
                  )}
                </div>
                <div className="text-sm">
                  {item.quantity} x ${item.price.toFixed(2)}
                </div>
                <div className="w-20 text-right font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-muted-foreground">Subtotal:</span>
          <span className="text-sm">${calculateSubtotal().toFixed(2)}</span>
        </div>
        
        {order.discount && order.discount > 0 && (
          <div className="flex justify-between mb-1 text-green-600">
            <span className="text-sm flex items-center">
              <Percent className="h-3 w-3 mr-1" />
              Descuento {order.discount}%:
            </span>
            <span className="text-sm">-${calculateDiscount().toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between mb-1">
          <span className="text-sm text-muted-foreground">IVA (16%):</span>
          <span className="text-sm">${calculateTax().toFixed(2)}</span>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
      
      {/* Print Pre-Bill button */}
      <Button 
        variant="outline" 
        className="mt-4 w-full flex items-center justify-center gap-2 hover:bg-muted" 
        onClick={handlePrintPreBill}
      >
        <Printer className="h-4 w-4" />
        Imprimir Pre-cuenta
      </Button>
      
      <Button 
        className="mt-2 w-full" 
        size="lg"
        onClick={onPaymentClick}
      >
        <DollarSign className="mr-2 h-5 w-5" />
        Procesar Pago
      </Button>
    </div>
  );
};

export default OrderDetails;
