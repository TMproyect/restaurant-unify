
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderItem } from '@/services/orderService';
import { supabase } from '@/integrations/supabase/client';

interface OrderTakingProps {
  tableId: string;
  onOrderComplete: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
}

const OrderTaking: React.FC<OrderTakingProps> = ({ tableId, onOrderComplete }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
    loadMenuCategories();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      let query = supabase.from('menu_items').select('id, name, price, description, image_url');
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }
      const { data, error } = await query;

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error cargando items del menú:', error);
      toast.error('Error al cargar los items del menú');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error cargando categorías del menú:', error);
      toast.error('Error al cargar las categorías del menú');
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, [selectedCategory]);

  const handleAddItem = (item: MenuItem) => {
    const existingItemIndex = orderItems.findIndex(orderItem => orderItem.menu_item_id === item.id);

    if (existingItemIndex > -1) {
      const newOrderItems = [...orderItems];
      newOrderItems[existingItemIndex].quantity += 1;
      setOrderItems(newOrderItems);
    } else {
      const newOrderItem: OrderItem = {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: '',
      };
      setOrderItems([...orderItems, newOrderItem]);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 0) return;

    const newOrderItems = [...orderItems];
    newOrderItems[index].quantity = quantity;
    setOrderItems(newOrderItems);
  };

  const handleRemoveItem = (index: number) => {
    const newOrderItems = [...orderItems];
    newOrderItems.splice(index, 1);
    setOrderItems(newOrderItems);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const newOrderItems = [...orderItems];
    newOrderItems[index].notes = notes;
    setOrderItems(newOrderItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Debe agregar al menos un item a la orden');
      return;
    }

    try {
      // Crear la orden en la base de datos
      // const orderData = await createOrder({
      //   table_id: tableId,
      //   customer_name: 'Cliente', // TODO: Obtener el nombre del cliente
      //   status: 'pending',
      //   total: calculateTotal(),
      //   items_count: orderItems.length,
      //   is_delivery: false,
      // }, orderItems);

      // if (orderData) {
        toast.success('Orden enviada a cocina');
        setOrderItems([]);
        setNotes('');
        onOrderComplete();
      // } else {
      //   toast.error('Error al crear la orden');
      // }
    } catch (error) {
      console.error('Error al enviar la orden:', error);
      toast.error('Error al enviar la orden');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Sección de Menú */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4">
            <Label htmlFor="category">Categoría</Label>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[500px] w-full rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {loading ? (
                <div className="col-span-2 text-center">Cargando...</div>
              ) : (
                menuItems.map((item) => (
                  <div key={item.id} className="border rounded-md p-3 hover:bg-secondary/50 cursor-pointer" onClick={() => handleAddItem(item)}>
                    <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-muted-foreground text-xs">{item.description?.substring(0, 50)}</p>
                    <p className="text-sm">${item.price.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sección de Orden */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Orden</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="font-medium">${calculateTotal().toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <div className="mt-4">
            <Label htmlFor="notes">Notas adicionales</Label>
            {orderItems.map((item, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm font-medium">{item.name}</p>
                <Input
                  type="text"
                  placeholder="Agregar notas..."
                  value={item.notes || ''}
                  onChange={(e) => handleNotesChange(index, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <Button className="w-full mt-4" onClick={handleSubmitOrder}>
            Enviar a Cocina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTaking;
