import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Banknote, Receipt, Percent, 
  User, Users, SplitSquareVertical, Check, Loader2, 
  Printer, Mail, FileText, PlusCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface PaymentState {
  method: string;
  amount: number;
  cashReceived?: number;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  orderDetails, 
  onCancel,
  onPaymentComplete
}) => {
  const { order, items } = orderDetails || { order: null, items: [] };
  const [paymentStep, setPaymentStep] = useState<'form' | 'success'>('form');
  const [payments, setPayments] = useState<PaymentState[]>([]);
  const [currentPayment, setCurrentPayment] = useState<PaymentState>({
    method: 'cash',
    amount: 0,
    cashReceived: 0
  });
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

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
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

  const calculatePendingAmount = () => {
    const total = calculateTotal();
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, total - paidAmount);
  };

  useEffect(() => {
    if (order) {
      const pendingAmount = calculatePendingAmount();
      setCurrentPayment(prev => ({ ...prev, amount: pendingAmount }));
    }
  }, [order, payments]);
  
  useEffect(() => {
    if (currentPayment.method === 'cash' && currentPayment.cashReceived) {
      const cashReceived = currentPayment.cashReceived || 0;
      const amount = currentPayment.amount || 0;
      
      if (cashReceived >= amount) {
        setChange(cashReceived - amount);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [currentPayment]);

  const addPaymentMethod = () => {
    if (!currentPayment.amount || currentPayment.amount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a cero",
        variant: "destructive"
      });
      return;
    }
    
    setPayments([...payments, currentPayment]);
    const pendingAfterAdd = calculatePendingAmount() - currentPayment.amount;
    setCurrentPayment({
      method: 'cash',
      amount: Math.max(0, pendingAfterAdd),
      cashReceived: 0
    });
  };

  const removePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  const handlePayment = async () => {
    if (!order?.id) {
      toast({
        title: "Error",
        description: "No hay una orden seleccionada para procesar",
        variant: "destructive"
      });
      return;
    }
    
    const pendingAmount = calculatePendingAmount();
    const isValid = pendingAmount === 0 || 
                    (currentPayment.amount > 0 && 
                     currentPayment.amount === pendingAmount);
    
    if (!isValid) {
      toast({
        title: "Error",
        description: "El monto total no coincide con el monto pendiente",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPayment.amount > 0) {
      if (currentPayment.method === 'cash' && 
          (!currentPayment.cashReceived || currentPayment.cashReceived < currentPayment.amount)) {
        toast({
          title: "Error",
          description: "El efectivo recibido debe ser igual o mayor al monto a pagar",
          variant: "destructive"
        });
        return;
      }
      
      setPayments([...payments, currentPayment]);
    }
    
    try {
      console.log(`Processing payment for order ${order.id}`);
      setIsProcessing(true);
      
      const success = await updateOrderStatus(order.id, 'paid');
      
      if (success) {
        console.log(`Payment successful. Methods:`, payments);
        console.log(`Order total: ${calculateTotal().toFixed(2)}`);
        
        toast({
          title: "Pago exitoso",
          description: `Se ha registrado el pago por $${calculateTotal().toFixed(2)}`,
        });
        
        setPaymentStep('success');
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
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    toast({
      title: "Ticket impreso",
      description: "El ticket de venta se ha enviado a la impresora"
    });
  };

  const handlePrintInvoice = () => {
    toast({
      title: "Factura generada",
      description: "La factura fiscal se ha enviado a la impresora"
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Recibo enviado",
      description: "El recibo digital ha sido enviado por correo electrónico"
    });
  };
  
  const toggleDiscountType = () => {
    if (discountType === 'percent') {
      setDiscountType('amount');
      setDiscount(Math.round((discount / 100) * calculateSubtotal()));
    } else {
      setDiscountType('percent');
      const subtotal = calculateSubtotal();
      setDiscount(Math.round((discount / subtotal) * 100));
    }
  };
  
  const toggleTipType = () => {
    if (tipType === 'percent') {
      setTipType('amount');
      setTipAmount(Math.round((tipAmount / 100) * calculateSubtotal()));
    } else {
      setTipType('percent');
      const subtotal = calculateSubtotal();
      setTipAmount(Math.round((tipAmount / subtotal) * 100));
    }
  };
  
  const applyPredefinedDiscount = (value: number, type: 'percent' | 'amount') => {
    setDiscountType(type);
    setDiscount(value);
  };
  
  const applyPredefinedTip = (value: number, type: 'percent' | 'amount') => {
    setTipType(type);
    setTipAmount(value);
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
  
  if (paymentStep === 'success') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-600">Pago Registrado Exitosamente</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`} • #{order.id?.substring(0, 6)}
          </Badge>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-200">
          <div className="text-center mb-2">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-medium">Total Cobrado: ${calculateTotal().toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-lg">¿Qué desea hacer ahora?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handlePrintReceipt}
            >
              <Printer className="h-4 w-4" />
              Imprimir Ticket
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handlePrintInvoice}
            >
              <FileText className="h-4 w-4" />
              Imprimir Factura Fiscal
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleSendEmail}
            >
              <Mail className="h-4 w-4" />
              Enviar Recibo por Email
            </Button>
          </div>
        </div>
        
        <div className="flex-grow"></div>
        <Button 
          size="lg" 
          className="w-full mt-4" 
          onClick={onPaymentComplete}
        >
          Finalizar / Nueva Venta
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Procesar Pago</h2>
        <Badge 
          variant="outline" 
          className="bg-primary/10 text-primary border-primary/30"
        >
          {order.is_delivery ? 'Delivery' : `Mesa ${order.table_number}`} • #{order.id?.substring(0, 6)}
        </Badge>
      </div>
      
      <div className="bg-muted/30 p-3 rounded-md mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Cliente:</span>
          <span className="text-sm">{order.customer_name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Items:</span>
          <span className="text-sm">{items.length} productos</span>
        </div>
        <div className="flex justify-between mb-1 font-medium">
          <span>Total a Pagar:</span>
          <span className="text-primary">${calculateTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pendiente por Pagar:</span>
          <span className={calculatePendingAmount() > 0 ? "text-orange-600 font-medium" : "text-green-600 font-medium"}>
            ${calculatePendingAmount().toFixed(2)}
          </span>
        </div>
      </div>
      
      {payments.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Pagos Registrados</h3>
          <div className="space-y-2">
            {payments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                <div className="flex items-center">
                  {payment.method === 'cash' && <Banknote className="h-4 w-4 mr-2" />}
                  {payment.method === 'card' && <CreditCard className="h-4 w-4 mr-2" />}
                  {payment.method === 'transfer' && <Receipt className="h-4 w-4 mr-2" />}
                  <span>{payment.method === 'cash' ? 'Efectivo' : payment.method === 'card' ? 'Tarjeta' : 'Transferencia'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${payment.amount.toFixed(2)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive" 
                    onClick={() => removePayment(index)}
                  >
                    <span className="sr-only">Remove</span>
                    &times;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <h3 className="font-medium mb-2">Método de Pago</h3>
      <RadioGroup 
        value={currentPayment.method} 
        onValueChange={(value) => setCurrentPayment({...currentPayment, method: value})}
        className="grid grid-cols-3 gap-2 mb-4"
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
      
      <div className="mb-4 space-y-4">
        <div>
          <Label htmlFor="paymentAmount">Monto a Pagar [{currentPayment.method === 'cash' ? 'Efectivo' : currentPayment.method === 'card' ? 'Tarjeta' : 'Transferencia'}]</Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="paymentAmount"
              type="number"
              min="0"
              step="0.01"
              className="pl-8"
              value={currentPayment.amount || ''}
              onChange={(e) => setCurrentPayment({
                ...currentPayment, 
                amount: parseFloat(e.target.value) || 0
              })}
            />
          </div>
        </div>
        
        {currentPayment.method === 'cash' && (
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
                  value={currentPayment.cashReceived || ''}
                  onChange={(e) => setCurrentPayment({
                    ...currentPayment, 
                    cashReceived: parseFloat(e.target.value) || 0
                  })}
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
        )}
      </div>
      
      <Button 
        variant="outline" 
        className="mb-4 flex items-center gap-2"
        onClick={addPaymentMethod}
        disabled={!currentPayment.amount || currentPayment.amount <= 0 || calculatePendingAmount() <= 0}
      >
        <PlusCircle className="h-4 w-4" />
        Añadir Método de Pago
      </Button>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Ajustes Adicionales</h3>
        <div className="flex gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">Aplicar Descuento</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => applyPredefinedDiscount(10, 'percent')}>
                Descuento Empleado (10%)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyPredefinedDiscount(500, 'amount')}>
                Promo Martes ($500)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyPredefinedDiscount(0, 'percent')}>
                Quitar Descuento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1">Añadir Propina</Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-2">
                <h4 className="font-medium">Propina Rápida</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => applyPredefinedTip(10, 'percent')}>10%</Button>
                  <Button size="sm" variant="outline" onClick={() => applyPredefinedTip(15, 'percent')}>15%</Button>
                  <Button size="sm" variant="outline" onClick={() => applyPredefinedTip(0, 'percent')}>Quitar</Button>
                </div>
                <div className="pt-2">
                  <Label htmlFor="customTip">Propina personalizada</Label>
                  <div className="flex items-center mt-1">
                    <Input 
                      id="customTip" 
                      type="number" 
                      value={tipAmount}
                      min="0"
                      onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="ml-2" 
                      onClick={toggleTipType}
                    >
                      {tipType === 'percent' ? '%' : '$'}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setIsSplitDialogOpen(true)}
          >
            Dividir Cuenta
          </Button>
        </div>
      </div>
      
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
      
      <div className="flex justify-between pt-6 gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button 
          className="flex-1" 
          onClick={handlePayment} 
          disabled={
            isProcessing || 
            calculatePendingAmount() !== 0 || 
            (payments.length === 0 && currentPayment.amount <= 0)
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Confirmar Pago ${calculateTotal().toFixed(2)}
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
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
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="person2" className="space-y-2 mt-2">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <input type="checkbox" />
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="person3" className="space-y-2 mt-2">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <input type="checkbox" />
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSplitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setIsSplitDialogOpen(false);
              toast({
                title: "Cuenta dividida",
                description: "La cuenta ha sido dividida correctamente"
              });
            }}>
              Aplicar División
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentPanel;
