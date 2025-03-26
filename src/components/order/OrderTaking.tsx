
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import MenuItems from './MenuItems';
import OrderCart, { CartItem } from './OrderCart';

interface OrderTakingProps {
  tableId: string;
  onOrderComplete: () => void;
}

const OrderTaking: React.FC<OrderTakingProps> = ({ tableId, onOrderComplete }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  const handleCheckout = (paymentMethod: string) => {
    // Simulación de envío de orden
    toast({
      title: "Pedido procesado",
      description: `Pedido para Mesa ${tableId} enviado a cocina`
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
        <OrderCart 
          items={cartItems}
          tableId={tableId}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
};

export default OrderTaking;
