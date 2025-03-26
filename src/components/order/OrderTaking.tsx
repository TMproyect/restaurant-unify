
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
  const { toast } = useToast();

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
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

  const handleSendToKitchen = () => {
    if (cartItems.length === 0) {
      toast({
        title: "No hay productos",
        description: "Añade productos al pedido antes de enviarlo",
        variant: "destructive"
      });
      return;
    }

    // Get the kitchen name for the toast message
    const kitchenName = kitchenOptions.find(k => k.id === selectedKitchen)?.name || "Cocina";
    
    // Simulación de envío de orden a la cocina seleccionada
    toast({
      title: "Pedido enviado a cocina",
      description: `Pedido para Mesa ${tableId} enviado a ${kitchenName}`
    });
    
    // Reiniciar el carrito
    setCartItems([]);
    
    // Notificar que la orden está completa
    onOrderComplete();
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
              >
                Enviar a Cocina
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
