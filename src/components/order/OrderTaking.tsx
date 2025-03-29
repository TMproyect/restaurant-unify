
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
import { CartItem } from './CartItem';
import { Utensils, Search, Tag, Percent, Info, ChefHat, AlertCircle } from 'lucide-react';
import { getKitchens } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

const OrderTaking: React.FC<OrderTakingProps> = ({ 
  tableId,
  onOrderComplete
}: OrderTakingProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKitchen, setSelectedKitchen] = useState<string>('main');
  const [kitchenOptions, setKitchenOptions] = useState<{id: string, name: string}[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [tableInfo, setTableInfo] = useState<{number: number, zone: string} | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
    fetchKitchens();
    fetchTableInfo();
  }, []);

  const fetchKitchens = async () => {
    try {
      const kitchens = await getKitchens();
      console.log('Available kitchens:', kitchens);
      setKitchenOptions(kitchens);
    } catch (error) {
      console.error('Error fetching kitchens:', error);
      toast.error('Error al cargar las cocinas disponibles');
    }
  };

  const fetchTableInfo = async () => {
    if (!tableId) return;
    
    try {
      console.log(`Fetching information for table ID: ${tableId}`);
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('number, zone')
        .eq('id', tableId)
        .single();
        
      if (error) {
        console.error('Error fetching table info:', error);
        throw error;
      }
      
      console.log('Table info fetched:', data);
      setTableInfo(data);
    } catch (error) {
      console.error('Error getting table information:', error);
      toast.error('Error al cargar información de la mesa');
    }
  };

  const fetchMenuItems = async (categoryId?: string) => {
    try {
      setLoading(true);
      console.log('Fetching menu items...');
      let query = supabase.from('menu_items').select('*');
      
      if (categoryId && categoryId !== 'all') {
        console.log(`Filtering by category ID: ${categoryId}`);
        query = query.eq('category_id', filterValue(categoryId));
      }
      
      // Only show available items - using our custom filterBooleanValue helper
      query = query.eq('available', filterBooleanValue(true));
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }
      
      const items = mapArrayResponse<MenuItem>(data, 'Failed to map menu items');
      console.log(`Fetched ${items.length} menu items`);
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching menu categories...');
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching menu categories:', error);
        throw error;
      }

      const cats = mapArrayResponse<Category>(data, 'Failed to map menu categories');
      console.log(`Fetched ${cats.length} menu categories`);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      toast.error('Error al cargar las categorías del menú');
      // Fallback to default categories if there's an error
      setCategories([
        { id: 'entradas', name: 'Entradas' },
        { id: 'principal', name: 'Platos Principales' },
        { id: 'bebidas', name: 'Bebidas' }
      ]);
    }
  };

  const addToCart = (item: MenuItem) => {
    console.log('Adding to cart:', item);
    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    };
    setCartItems(prevItems => [...prevItems, cartItem]);
    toast.success(`${item.name} añadido al pedido`);
  };

  const removeFromCart = (itemId: string) => {
    console.log('Removing from cart, item ID:', itemId);
    setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
    toast.info('Ítem eliminado del pedido');
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCartItems([]);
    setDiscount(0);
    toast.info('Carrito vaciado');
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log(`Selected category: ${categoryId}`);
    setSelectedCategory(categoryId);
    fetchMenuItems(categoryId);
  };

  const handleSendToKitchen = () => {
    if (cartItems.length === 0) {
      toast.error('No hay ítems en el pedido');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('Por favor ingrese el nombre del cliente');
      return;
    }
    
    console.log('Sending order to kitchen:', {
      items: cartItems,
      kitchen: selectedKitchen,
      customer: customerName,
      discount: discount
    });
    
    onOrderComplete();
  };

  const handleDiscountChange = (value: number) => {
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    console.log(`Setting discount to ${value}%`);
    setDiscount(value);
  };

  // Apply search filter
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.18; // 18%
  const serviceRate = 0.10; // 10%
  const taxAmount = subtotal * taxRate;
  const serviceAmount = subtotal * serviceRate;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + taxAmount + serviceAmount - discountAmount;

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Left side - Menu items */}
      <div className="w-full md:w-2/3 p-4 border-r overflow-auto">
        <div className="mb-4 space-y-4">
          {/* Table and customer info */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="bg-primary/10 text-primary rounded-lg px-3 py-2 text-sm font-medium flex items-center">
              <Info className="mr-2 h-4 w-4" />
              Mesa {tableInfo?.number || '...'} - {tableInfo?.zone || '...'}
            </div>
            
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Nombre del cliente..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar platillo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Categories and Menu Items */}
        <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
          <div className="relative">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <TabsList className="mb-4 w-max">
                <TabsTrigger value="all" className="px-4">Todos</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="px-4">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="h-32 bg-muted">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <TabsContent value="all" className="mt-0">
              {filteredMenuItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenuItems.map(item => (
                    <Card key={item.id} className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow">
                      {item.image_url ? (
                        <div className="h-32 relative overflow-hidden">
                          <AspectRatio ratio={16/9}>
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                                console.error(`Error loading image for ${item.name}`);
                              }}
                            />
                          </AspectRatio>
                          {item.popular && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Popular</Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-32 bg-muted flex items-center justify-center">
                          <Utensils className="h-10 w-10 text-muted-foreground opacity-50" />
                          {item.popular && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Popular</Badge>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="p-3 pt-0">
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                        
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>Contiene: {item.allergens.join(', ')}</span>
                          </div>
                        )}
                        
                        <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                      </CardContent>
                      
                      <CardFooter className="p-3 pt-0 justify-end">
                        <Button size="sm" onClick={() => addToCart(item)}>Agregar</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <SearchIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No se encontraron resultados</p>
                  <p className="text-sm text-muted-foreground mt-1">Intenta con otra búsqueda o categoría</p>
                </div>
              )}
            </TabsContent>
          )}
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <Skeleton key={n} className="h-40 w-full" />
                  ))}
                </div>
              ) : filteredMenuItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenuItems.map(item => (
                    <Card key={item.id} className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow">
                      {item.image_url ? (
                        <div className="h-32 relative overflow-hidden">
                          <AspectRatio ratio={16/9}>
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                                console.error(`Error loading image for ${item.name}`);
                              }}
                            />
                          </AspectRatio>
                          {item.popular && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Popular</Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-32 bg-muted flex items-center justify-center">
                          <Utensils className="h-10 w-10 text-muted-foreground opacity-50" />
                          {item.popular && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">Popular</Badge>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="p-3 pt-0">
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                        
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>Contiene: {item.allergens.join(', ')}</span>
                          </div>
                        )}
                        
                        <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                      </CardContent>
                      
                      <CardFooter className="p-3 pt-0 justify-end">
                        <Button size="sm" onClick={() => addToCart(item)}>Agregar</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <SearchIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No se encontraron resultados</p>
                  <p className="text-sm text-muted-foreground mt-1">Intenta con otra búsqueda o categoría</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Right side - Cart */}
      <div className="w-full md:w-1/3 p-4 overflow-auto">
        <Card className="h-full">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Pedido Mesa {tableInfo?.number || '...'}
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {cartItems.length} {cartItems.length === 1 ? 'ítem' : 'ítems'}
              </Badge>
            </div>
            {customerName && (
              <p className="text-sm text-muted-foreground">Cliente: {customerName}</p>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {cartItems.length > 0 ? (
              <div>
                {/* Cart items */}
                <div className="divide-y divide-border max-h-[250px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
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
                            className="h-7 w-7"
                            onClick={() => {
                              const newQuantity = item.quantity - 1;
                              if (newQuantity <= 0) {
                                removeFromCart(item.id);
                              } else {
                                setCartItems(items => 
                                  items.map(i => i.id === item.id ? {...i, quantity: newQuantity} : i)
                                );
                              }
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {
                              setCartItems(items => 
                                items.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i)
                              );
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Discount section */}
                <div className="p-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm font-medium">Descuento</span>
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => handleDiscountChange(Number(e.target.value))}
                        className="h-8 text-right"
                      />
                    </div>
                    <span className="text-sm">%</span>
                  </div>
                </div>
                
                {/* Kitchen selection */}
                <div className="p-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cocina destino</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {kitchenOptions.map(kitchen => (
                      <Button
                        key={kitchen.id}
                        variant={selectedKitchen === kitchen.id ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          console.log(`Selected kitchen: ${kitchen.id}`);
                          setSelectedKitchen(kitchen.id);
                        }}
                      >
                        {kitchen.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="p-3 border-t border-border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento ({discount}%)</span>
                      <span className="text-red-500">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuesto (18%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Servicio (10%)</span>
                    <span>${serviceAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-3 border-t border-border space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSendToKitchen}
                    disabled={cartItems.length === 0 || !customerName.trim()}
                  >
                    <ChefHat className="mr-2 h-4 w-4" />
                    Enviar a Cocina
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={clearCart}
                    disabled={cartItems.length === 0}
                  >
                    Vaciar carrito
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <CartIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                <p>No hay ítems en el carrito</p>
                <p className="text-sm mt-1">Añade productos del menú para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper icons for empty states
const SearchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CartIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

export default OrderTaking;
