
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OrderItem } from '@/services/orderService';
import { supabase } from '@/integrations/supabase/client';
import { Trash, Minus, Plus, ShoppingBag } from 'lucide-react';

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

interface Kitchen {
  id: string;
  name: string;
}

const OrderTaking: React.FC<OrderTakingProps> = ({ tableId, onOrderComplete }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [noteItem, setNoteItem] = useState<OrderItem | null>(null);
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);

  useEffect(() => {
    loadMenuItems();
    loadMenuCategories();
    loadKitchens();
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

  const loadKitchens = async () => {
    try {
      // Simulamos datos de cocinas - en un caso real se cargarían desde la base de datos
      setKitchens([
        { id: 'kitchen1', name: 'Cocina Principal' },
        { id: 'kitchen2', name: 'Cocina de Postres' },
        { id: 'kitchen3', name: 'Cocina de Bebidas' }
      ]);
      setSelectedKitchen('kitchen1'); // Seleccionamos la primera cocina por defecto
    } catch (error) {
      console.error('Error cargando cocinas:', error);
      toast.error('Error al cargar las cocinas');
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

  const handleQuantityChange = (index: number, action: 'increase' | 'decrease' | 'set', value?: number) => {
    const newOrderItems = [...orderItems];
    
    if (action === 'increase') {
      newOrderItems[index].quantity += 1;
    } else if (action === 'decrease') {
      if (newOrderItems[index].quantity > 1) {
        newOrderItems[index].quantity -= 1;
      }
    } else if (action === 'set' && value !== undefined) {
      if (value > 0) {
        newOrderItems[index].quantity = value;
      }
    }
    
    setOrderItems(newOrderItems);
  };

  const handleRemoveItem = (index: number) => {
    const newOrderItems = [...orderItems];
    newOrderItems.splice(index, 1);
    setOrderItems(newOrderItems);
  };

  const openNoteSheet = (item: OrderItem) => {
    setNoteItem(item);
    setIsNoteSheetOpen(true);
  };

  const handleNotesChange = (notes: string) => {
    if (noteItem) {
      const index = orderItems.findIndex(item => 
        item.menu_item_id === noteItem.menu_item_id && 
        item.name === noteItem.name
      );
      
      if (index !== -1) {
        const newOrderItems = [...orderItems];
        newOrderItems[index].notes = notes;
        setOrderItems(newOrderItems);
      }
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    } else {
      return discount;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    return subtotal - discountAmount;
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Debe agregar al menos un item a la orden');
      return;
    }

    if (!selectedKitchen) {
      toast.error('Debe seleccionar una cocina');
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
      //   kitchen_id: selectedKitchen
      // }, orderItems);

      // if (orderData) {
        toast.success('Orden enviada a cocina');
        setOrderItems([]);
        setNotes('');
        setDiscount(0);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full max-h-full overflow-hidden">
      {/* Menu Section */}
      <Card className="h-full flex flex-col">
        <CardContent className="p-4 flex-grow overflow-hidden flex flex-col">
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
          <ScrollArea className="flex-grow rounded-md border">
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

      {/* Order Section */}
      <Card className="h-full flex flex-col">
        <ScrollArea className="h-full">
          <CardContent className="p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Orden</h2>
            <div className="mb-4">
              <Label htmlFor="kitchen">Cocina Destino</Label>
              <Select onValueChange={setSelectedKitchen} value={selectedKitchen}>
                <SelectTrigger id="kitchen">
                  <SelectValue placeholder="Seleccionar cocina" />
                </SelectTrigger>
                <SelectContent>
                  {kitchens.map((kitchen) => (
                    <SelectItem key={kitchen.id} value={kitchen.id}>
                      {kitchen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border rounded-md mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-24 text-center">Cant.</TableHead>
                    <TableHead className="w-24 text-right">Precio</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div>{item.name}</div>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(index, 'decrease')}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(index, 'increase')}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => openNoteSheet(item)}>
                          Notas
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => handleRemoveItem(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orderItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Aún no hay items en la orden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mb-4">
              <Label htmlFor="order-notes" className="mb-2 block">Notas de la orden</Label>
              <Textarea 
                id="order-notes"
                placeholder="Añadir notas para toda la orden..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>Descuento</span>
                  <Select 
                    value={discountType} 
                    onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed')}
                  >
                    <SelectTrigger className="h-7 w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 h-7"
                    min="0"
                  />
                </div>
                <span>-${calculateDiscount().toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </ScrollArea>
        
        {/* Fixed position button at the bottom */}
        <div className="p-4 border-t">
          <Button 
            className="w-full" 
            onClick={handleSubmitOrder} 
            disabled={orderItems.length === 0}
            size="lg"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Crear Pedido
          </Button>
        </div>
      </Card>

      {/* Hoja lateral para notas */}
      <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notas para {noteItem?.name}</SheetTitle>
            <SheetDescription>
              Añade notas o instrucciones especiales para este item.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <textarea
              className="w-full p-2 border rounded-md h-40"
              placeholder="Añadir notas especiales..."
              value={noteItem?.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
            />
            <Button 
              className="w-full mt-4" 
              onClick={() => setIsNoteSheetOpen(false)}
            >
              Guardar Notas
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrderTaking;
