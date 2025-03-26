
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote,
  Smartphone,
  Users
} from 'lucide-react';
import { paymentMethods } from '@/data/menuData';
import { useToast } from '@/hooks/use-toast';

// Definición de tipos para los items del carrito
export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options?: {
    name: string;
    choice: {
      id: string;
      name: string;
      price: number;
    }
  }[];
  notes?: string;
}

interface OrderCartProps {
  items: CartItem[];
  tableId: string;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (paymentMethod: string) => void;
}

const OrderCart: React.FC<OrderCartProps> = ({ 
  items, 
  tableId, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState('');
  const { toast } = useToast();

  // Calcular el subtotal
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const optionsTotal = item.options ? 
      item.options.reduce((acc, opt) => acc + opt.choice.price, 0) * item.quantity : 0;
    return sum + itemTotal + optionsTotal;
  }, 0);

  // Valores fijos para este ejemplo
  const tax = subtotal * 0.18; // 18% de impuesto
  const serviceCharge = subtotal * 0.10; // 10% de cargo por servicio
  const total = subtotal + tax + serviceCharge;

  const getPaymentIcon = (paymentId: string) => {
    switch(paymentId) {
      case 'efectivo': return <Banknote className="mr-2" />;
      case 'tarjeta': return <CreditCard className="mr-2" />;
      case 'movil': return <Smartphone className="mr-2" />;
      case 'dividir': return <Users className="mr-2" />;
      default: return null;
    }
  };

  const handleCheckout = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Selecciona un método de pago",
        description: "Debes seleccionar un método de pago para continuar",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Añade productos al carrito antes de continuar",
        variant: "destructive",
      });
      return;
    }

    onCheckout(selectedPaymentMethod);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Pedido Mesa {tableId}</h3>
          <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded">
            {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
          </div>
        </div>
      </div>
      
      {items.length > 0 ? (
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="p-3 hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  {item.options && item.options.length > 0 && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.options.map((opt, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{opt.name}: {opt.choice.name}</span>
                          {opt.choice.price > 0 && (
                            <span>${opt.choice.price.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Nota: {item.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.price.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground">
          <p>No hay ítems en el carrito</p>
          <p className="text-sm mt-1">Añade productos del menú para comenzar</p>
        </div>
      )}
      
      <div className="p-4 bg-muted/20">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Impuesto (18%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Servicio (10%)</span>
            <span>${serviceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <h4 className="font-medium mb-3">Método de pago</h4>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {paymentMethods.map(method => (
            <Button
              key={method.id}
              type="button"
              variant={selectedPaymentMethod === method.id ? "default" : "outline"}
              className="justify-start"
              onClick={() => setSelectedPaymentMethod(method.id)}
            >
              {getPaymentIcon(method.id)}
              <span>{method.name}</span>
            </Button>
          ))}
        </div>
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleCheckout}
        >
          Procesar Orden
        </Button>
      </div>
    </div>
  );
};

export default OrderCart;
