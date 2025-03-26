
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import MenuItems from './MenuItems';
import OrderCart, { CartItem } from './OrderCart';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrder } from '@/services/orderService';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface OrderTakingProps {
  tableId: string;
  onOrderComplete: () => void;
}

// Kitchen options for restaurants with multiple kitchen areas
const kitchenOptions = [
  { id: "main", name: "Cocina Principal" },
  { id: "grill", name: "Parrilla" },
  { id: "cold", name: "Cocina Fría" },
  { id: "pastry", name: "Pastelería" },
];

const OrderTaking: React.FC<OrderTakingProps> = ({ tableId, onOrderComplete }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState("main");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = (item: CartItem) => {
    // Generar un ID único para el item del carrito
    const cartItem = {
      ...item,
      id: uuidv4() // Asegura que cada item tenga un ID único en el carrito
    };
    setCartItems(prev => [...prev, cartItem]);
    toast({
      title: "Producto añadido",
      description: `${item.name} añadido al pedido`
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    
    if (itemToRemove) {
      toast({
        title: "Producto eliminado",
        description: `${itemToRemove.name} eliminado del pedido`
      });
    }
  };

  const handleSendToKitchen = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "No hay productos",
        description: "Añade productos al pedido antes de enviarlo",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Calcular el total del pedido
      const subtotal = cartItems.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const optionsTotal = item.options ? 
          item.options.reduce((acc, opt) => acc + opt.choice.price, 0) * item.quantity : 0;
        return sum + itemTotal + optionsTotal;
      }, 0);
      
      // Impuesto y servicio
      const tax = subtotal * 0.18; // 18% impuesto
      const serviceCharge = subtotal * 0.10; // 10% servicio
      const total = subtotal + tax + serviceCharge;
      
      // Obtener datos de la mesa si es necesario
      let tableNumber = null;
      let tableDbId = null;
      
      if (tableId !== 'Delivery') {
        // Buscar mesa por número
        const { data: tableData } = await supabase
          .from('restaurant_tables')
          .select('id, number')
          .eq('number', parseInt(tableId))
          .single();
          
        if (tableData) {
          tableNumber = tableData.number;
          tableDbId = tableData.id;
        }
      }
      
      // Objeto de orden
      const order = {
        table_id: tableDbId,
        table_number: tableNumber,
        customer_name: "Cliente Mesa " + tableId,
        status: 'pending' as const,
        total: Number(total.toFixed(2)),
        items_count: cartItems.length,
        is_delivery: tableId === 'Delivery',
        kitchen_id: selectedKitchen
      };
      
      // Preparar items de la orden
      const orderItems = cartItems.map(item => ({
        menu_item_id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes
      }));
      
      // Crear la orden en la base de datos
      const result = await createOrder(order, orderItems);
      
      if (result) {
        // Get the kitchen name for the toast message
        const kitchenName = kitchenOptions.find(k => k.id === selectedKitchen)?.name || "Cocina";
        
        toast({
          title: "Pedido enviado a cocina",
          description: `Pedido para ${tableId === 'Delivery' ? 'Delivery' : 'Mesa ' + tableId} enviado a ${kitchenName}`
        });
        
        // Reiniciar el carrito
        setCartItems([]);
        
        // Notificar que la orden está completa
        onOrderComplete();
      } else {
        throw new Error("No se pudo crear la orden");
      }
    } catch (error) {
      console.error("Error al crear la orden:", error);
      toast({
        title: "Error al crear la orden",
        description: "Ha ocurrido un error al procesar el pedido",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <MenuItems onAddToCart={handleAddToCart} />
      </div>
      <div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-border shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-lg mb-2">Enviar pedido a cocina</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar cocina</label>
              <Select value={selectedKitchen} onValueChange={setSelectedKitchen}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cocina" />
                </SelectTrigger>
                <SelectContent>
                  {kitchenOptions.map(kitchen => (
                    <SelectItem key={kitchen.id} value={kitchen.id}>
                      {kitchen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium mt-2"
                onClick={handleSendToKitchen}
                disabled={processing || cartItems.length === 0}
              >
                {processing ? "Procesando..." : "Enviar a Cocina"}
              </button>
            </div>
          </div>
        </div>
        <OrderCart 
          items={cartItems}
          tableId={tableId}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onSendToKitchen={handleSendToKitchen}
          selectedKitchen={selectedKitchen}
          onSelectKitchen={setSelectedKitchen}
          kitchenOptions={kitchenOptions}
        />
      </div>
    </div>
  );
};

export default OrderTaking;
