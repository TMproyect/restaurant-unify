
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import OrderCart from './OrderCart';
import { supabase } from '@/integrations/supabase/client';
import { filterValue, filterBooleanValue, mapArrayResponse } from '@/utils/supabaseHelpers';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  available: boolean;
  popular: boolean;
  allergens: string[] | null;
}

interface Category {
  id: string;
  name: string;
}

interface OrderTakingProps {
  tableId: string;
  onOrderComplete: () => void;
}

const OrderTaking = ({ 
  tableId,
  onOrderComplete
}: OrderTakingProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async (categoryId?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('menu_items').select('*');
      
      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', filterValue(categoryId));
      }
      
      // Only show available items - using our custom filterBooleanValue helper
      query = query.eq('available', filterBooleanValue(true));
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMenuItems(mapArrayResponse(data, 'Failed to map menu items'));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCategories(mapArrayResponse(data, 'Failed to map menu categories'));
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      toast.error('Error al cargar las categorías del menú');
    }
  };

  const addToCart = (item: MenuItem) => {
    setCartItems([...cartItems, item]);
  };

  const removeFromCart = (item: MenuItem) => {
    setCartItems(cartItems.filter(i => i.id !== item.id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchMenuItems(categoryId);
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full">
      <div className="w-2/3 p-4 border-r">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar platillo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-[100px_225px_.5fr] mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <ScrollArea className="snap-x scroll-smooth w-full">
              <div className="inline-flex">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
                ))}
              </div>
            </ScrollArea>
          </TabsList>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenuItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                      </CardContent>
                      <CardFooter className="justify-end">
                        <Button size="sm" onClick={() => addToCart(item)}>Agregar</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {categories.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map(item => (
                      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle>{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter className="justify-end">
                          <Button size="sm" onClick={() => addToCart(item)}>Agregar</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>
      </div>
      <div className="w-1/3 p-4">
        <OrderCart 
          items={cartItems} 
          onRemoveItem={(id) => removeFromCart(menuItems.find(item => item.id === id) as MenuItem)}
          onUpdateQuantity={(id, quantity) => console.log(id, quantity)}
          onSendToKitchen={onOrderComplete}
          selectedKitchen={'main'}
          onSelectKitchen={(kitchenId) => console.log(kitchenId)}
          kitchenOptions={[{id: 'main', name: 'Principal'}]}
          tableId={tableId}
        />
      </div>
    </div>
  );
};

export default OrderTaking;
