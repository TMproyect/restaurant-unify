
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Receipt, Edit, ReceiptText, Percent, DollarSign, Printer } from 'lucide-react';
import { Order, OrderItem } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

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

  const handlePrintPreBill = () => {
    if (!order) return;
    
    console.log('Printing pre-bill for order:', order.id);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Format date in a locale-friendly way
      const dateOptions: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const formattedDate = new Date().toLocaleDateString('es-MX', dateOptions);
      
      // Generate the HTML content for the pre-bill
      const html = `
        <html>
          <head>
            <title>Pre-cuenta Mesa ${order.table_number}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                max-width: 300px;
                margin: 0 auto;
                padding: 10px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .subtitle {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
              }
              .info {
                margin-bottom: 15px;
                font-size: 14px;
              }
              .divider {
                border-top: 1px dashed #ccc;
                margin: 10px 0;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 14px;
              }
              .item-name {
                flex: 2;
              }
              .item-qty {
                flex: 0.5;
                text-align: center;
              }
              .item-price {
                flex: 1;
                text-align: right;
              }
              .item-total {
                flex: 1;
                text-align: right;
                font-weight: bold;
              }
              .totals {
                margin-top: 10px;
                text-align: right;
                font-size: 14px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .grand-total {
                font-size: 16px;
                font-weight: bold;
                margin-top: 5px;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                text-align: center;
                font-style: italic;
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="header">
              <div class="title">RESTAURANTE DEMO</div>
              <div class="subtitle">PRE-CUENTA</div>
            </div>
            
            <div class="info">
              <div><strong>Mesa:</strong> ${order.table_number}</div>
              <div><strong>Cliente:</strong> ${order.customer_name}</div>
              <div><strong>Fecha:</strong> ${formattedDate}</div>
              <div><strong>Orden:</strong> #${order.id?.substring(0, 6)}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="item" style="font-weight: bold;">
              <div class="item-name">Descripción</div>
              <div class="item-qty">Cant</div>
              <div class="item-price">Precio</div>
              <div class="item-total">Total</div>
            </div>
            
            ${items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              ${item.notes ? `<div style="font-size: 12px; color: #666; margin-left: 10px;">${item.notes}</div>` : ''}
            `).join('')}
            
            <div class="divider"></div>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              ${order.discount ? `
              <div class="total-row" style="color: green;">
                <span>Descuento (${order.discount}%):</span>
                <span>-$${calculateDiscount().toFixed(2)}</span>
              </div>
              ` : ''}
              
              <div class="total-row">
                <span>IVA (16%):</span>
                <span>$${calculateTax().toFixed(2)}</span>
              </div>
              
              <div class="grand-total">
                <span>TOTAL:</span>
                <span>$${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p>CUENTA PRELIMINAR - NO ES COMPROBANTE FISCAL</p>
              <p>Gracias por su preferencia.</p>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Log when print is complete or cancelled
      printWindow.onafterprint = () => {
        console.log('Printing completed or cancelled');
        toast({
          title: "Pre-cuenta impresa",
          description: `Mesa ${order.table_number} - Cliente: ${order.customer_name}`,
        });
      };
      
      // Handle any errors that might occur
      setTimeout(() => {
        if (printWindow.closed) {
          console.log('Print window was closed');
        }
      }, 1000);
    } else {
      console.error('Could not open print window');
      toast({
        title: "Error al imprimir",
        description: "No se pudo abrir la ventana de impresión. Verifica la configuración de tu navegador.",
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
