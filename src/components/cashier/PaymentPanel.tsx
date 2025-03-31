
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Banknote, Receipt, Percent, 
  User, Users, SplitSquareVertical, Check, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order, OrderItem, updateOrderStatus } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface PaymentPanelProps {
  orderDetails: {
    order: Order | null;
    items: OrderItem[];
  } | null;
  onCancel: () => void;
  onPaymentComplete: () => void;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Efectivo', icon: <Banknote className="h-5 w-5" /> },
  { id: 'card', name: 'Tarjeta', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'transfer', name: 'Transferencia', icon: <Receipt className="h-5 w-5" /> },
];

const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  orderDetails, 
  onCancel,
  onPaymentComplete
}) => {
  const { order, items } = orderDetails || { order: null, items: [] };
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [splitType, setSplitType] = useState('equal');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [discount, setDiscount] = useState(order?.discount || 0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipType, setTipType] = useState<'percent' | 'amount'>('percent');
  const { toast } = useToast();

  // Calculate subtotal from items
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // Apply discount based on type (percent or amount)
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percent') {
      return subtotal * (discount / 100);
    } else {
      return discount; // Direct amount discount
    }
  };
  
  const calculateTax = () => {
    // Assuming 16% tax rate
    const subtotal = calculateSubtotal();
    const discountValue = calculateDiscount();
    return (subtotal - discountValue) * 0.16; // 16% tax
  };
  
  // Calculate tip based on type (percent or amount)
  const calculateTip = () => {
    if (tipType === 'percent') {
      return calculateSubtotal() * (tipAmount / 100);
    } else {
      return tipAmount; // Direct amount tip
    }
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountValue = calculateDiscount();
    const tax = calculateTax();
    const tipValue = calculateTip();
    return subtotal - discountValue + tax + tipValue;
  };
  
  // Calculate change when cash amount changes
  useEffect(() => {
    if (selectedPaymentMethod === 'cash' && cashReceived) {
      const cashAmount = parseFloat(cashReceived);
      const totalAmount = calculateTotal();
      
      if (!isNaN(cashAmount) && cashAmount >= totalAmount) {
        setChange(cashAmount - totalAmount);
      } else {
        setChange(0);
      }
    }
  }, [cashReceived, selectedPaymentMethod, discount, discountType, tipAmount, tipType]);

  const handlePayment = async () => {
    if (!order?.id) {
      toast({
        title: "Error",
        description: "No hay una orden seleccionada para procesar",
        variant: "destructive"
      });
      return;
    }
    
    // Validate payment data
    if (selectedPaymentMethod === 'cash' && (parseFloat(cashReceived) < calculateTotal() || !cashReceived)) {
      toast({
        title: "Error",
        description: "El efectivo recibido debe ser igual o mayor al total",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Processing payment for order ${order.id}`);
      setIsProcessing(true);
      
      // Update order status to 'paid' or relevant status
      const success = await updateOrderStatus(order.id, 'paid');
      
      if (success) {
        // Here you would integrate with your payment processor or register system
        
        console.log(`Payment successful. Method: ${selectedPaymentMethod}`);
        console.log(`Order total: ${calculateTotal().toFixed(2)}`);
        
        if (selectedPaymentMethod === 'cash') {
          console.log(`Cash received: ${cashReceived}`);
          console.log(`Change: ${change.toFixed(2)}`);
        }
        
        // Show success message
        toast({
          title: "Pago exitoso",
          description: `Se ha registrado el pago por $${calculateTotal().toFixed(2)}`,
        });
        
        // Close payment panel and notify parent
        onPaymentComplete();
      } else {
        throw new Error("No se pudo actualizar el estado de la orden");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error de pago",
        description: "Ocurrió un error al procesar el pago",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const toggleDiscountType = () => {
    if (discountType === 'percent') {
      setDiscountType('amount');
      // Convert percent to approximate amount
      setDiscount(Math.round((discount / 100) * calculateSubtotal()));
    } else {
      setDiscountType('percent');
      // Convert amount to approximate percent
      const subtotal = calculateSubtotal();
      setDiscount(Math.round((discount / subtotal) * 100));
    }
  };
  
  const toggleTipType = () => {
    if (tipType === 'percent') {
      setTipType('amount');
      // Convert percent to amount
      setTipAmount(Math.round((tipAmount / 100) * calculateSubtotal()));
    } else {
      setTipType('percent');
      // Convert amount to percent
      const subtotal = calculateSubtotal();
      setTipAmount(Math.round((tipAmount / subtotal) * 100));
    }
  };
  
  if (!order) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-1">No hay orden seleccionada</h3>
        <p className="text-muted-foreground">
          Regresa y selecciona una orden para procesar el pago
        </p>
        <Button className="mt-6" onClick={onCancel}>Regresar</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Procesar Pago</h2>
        <Badge 
          variant="outline" 
          className="bg-primary/10 text-primary border-primary/30"
        >
          {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`} • #{order.id?.substring(0, 6)}
        </Badge>
      </div>
      
      {/* Order summary */}
      <div className="bg-muted/30 p-3 rounded-md mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Cliente:</span>
          <span className="text-sm">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Items:</span>
          <span className="text-sm">{items.length} productos</span>
        </div>
      </div>
      
      {/* Payment options */}
      <h3 className="font-medium mb-2">Método de Pago</h3>
      <RadioGroup 
        value={selectedPaymentMethod} 
        onValueChange={setSelectedPaymentMethod}
        className="grid grid-cols-3 gap-2 mb-6"
      >
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <RadioGroupItem
              value={method.id}
              id={`payment-${method.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`payment-${method.id}`}
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
            >
              {method.icon}
              <span className="mt-1 text-sm">{method.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {/* Cash payment specific fields */}
      {selectedPaymentMethod === 'cash' && (
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cashReceived">Efectivo recibido</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cashReceived"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Cambio</Label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted/50 flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium">{change.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modifier options */}
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Discount Field */}
          <div>
            <Label htmlFor="discount" className="flex items-center justify-between mb-1">
              <span>Descuento</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={toggleDiscountType}
              >
                {discountType === 'percent' ? (
                  <Percent className="h-3.5 w-3.5" />
                ) : (
                  <DollarSign className="h-3.5 w-3.5" />
                )}
              </Button>
            </Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                min="0"
                step={discountType === 'percent' ? '1' : '0.01'}
                placeholder="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">
                {discountType === 'percent' ? '%' : '$'}
              </span>
            </div>
          </div>
          
          {/* Tip Field */}
          <div>
            <Label htmlFor="tip" className="flex items-center justify-between mb-1">
              <span>Propina</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={toggleTipType}
              >
                {tipType === 'percent' ? (
                  <Percent className="h-3.5 w-3.5" />
                ) : (
                  <DollarSign className="h-3.5 w-3.5" />
                )}
              </Button>
            </Label>
            <div className="relative">
              <Input
                id="tip"
                type="number"
                min="0"
                step={tipType === 'percent' ? '1' : '0.01'}
                placeholder="0"
                value={tipAmount || ''}
                onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">
                {tipType === 'percent' ? '%' : '$'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Split bill button */}
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => setIsSplitDialogOpen(true)}
      >
        <SplitSquareVertical className="mr-2 h-4 w-4" />
        Dividir Cuenta
      </Button>
      
      {/* Summary */}
      <div className="flex-grow">
        <h3 className="font-medium mb-2">Resumen</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Descuento {discountType === 'percent' ? `(${discount}%)` : ''}:
            </span>
            <span className="text-green-600">-${calculateDiscount().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">IVA (16%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Propina {tipType === 'percent' ? `(${tipAmount}%)` : ''}:
            </span>
            <span>${calculateTip().toFixed(2)}</span>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between pt-6 gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Finalizar Pago
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {/* Split bill dialog */}
      <Dialog open={isSplitDialogOpen} onOpenChange={setIsSplitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dividir Cuenta</DialogTitle>
            <DialogDescription>
              Escoge cómo quieres dividir la cuenta entre varios clientes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup 
              value={splitType} 
              onValueChange={setSplitType}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="split-equal" />
                <Label htmlFor="split-equal" className="flex items-center cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Dividir equitativamente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="split-custom" />
                <Label htmlFor="split-custom" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Dividir por producto
                </Label>
              </div>
            </RadioGroup>
            
            {splitType === 'equal' && (
              <div className="mt-4">
                <Label htmlFor="numberPeople" className="text-sm font-medium">
                  Número de personas
                </Label>
                <div className="flex items-center mt-1.5">
                  <Input 
                    id="numberPeople"
                    type="number" 
                    min="2" 
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 2)}
                    className="w-20"
                  />
                  <div className="ml-4 text-sm">
                    <div className="font-medium">
                      ${(calculateTotal() / numberOfPeople).toFixed(2)} por persona
                    </div>
                    <div className="text-muted-foreground">
                      Total: ${calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {splitType === 'custom' && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Selecciona los productos de cada persona
                </p>
                
                <Tabs defaultValue="person1">
                  <TabsList>
                    <TabsTrigger value="person1">Persona 1</TabsTrigger>
                    <TabsTrigger value="person2">Persona 2</TabsTrigger>
                    <TabsTrigger value="person3">Persona 3</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="person1" className="space-y-2 mt-2">
                    {/* This would be implemented with checkboxes for each item */}
                    <p className="text-sm text-muted-foreground">
                      Esta funcionalidad se completará en una actualización futura.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSplitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsSplitDialogOpen(false)}>
              Aplicar División
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentPanel;
