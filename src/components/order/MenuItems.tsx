
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CartItem } from './OrderCart';
import { fetchMenuItems, fetchMenuCategories, MenuItem, MenuCategory } from '@/services/menuService';
import { useToast } from '@/hooks/use-toast';

interface MenuItemsProps {
  onAddToCart: (item: CartItem) => void;
}

interface MenuItemOption {
  name: string;
  choices: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface ExtendedMenuItem extends MenuItem {
  options?: MenuItemOption[];
}

const MenuItems: React.FC<MenuItemsProps> = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [itemNotes, setItemNotes] = useState('');
  const [additionalItems, setAdditionalItems] = useState<string[]>([]);
  const [additionalItemText, setAdditionalItemText] = useState('');
  const [menuItems, setMenuItems] = useState<ExtendedMenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch menu items and categories from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [itemsData, categoriesData] = await Promise.all([
          fetchMenuItems(),
          fetchMenuCategories()
        ]);
        
        // Add mock options data for testing
        const itemsWithOptions = itemsData.map((item: MenuItem) => {
          return {
            ...item,
            options: []
          } as ExtendedMenuItem;
        });
        
        setMenuItems(itemsWithOptions);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading menu data:', error);
        toast({
          title: "Error de carga",
          description: "No se pudieron cargar los elementos del menú",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Listen for menu updates from other components
    const handleMenuUpdated = () => {
      loadData();
    };
    
    window.addEventListener('menuItemsUpdated', handleMenuUpdated);
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdated);
    };
  }, [toast]);

  // Filtrar items del menú
  const filteredItems = menuItems.filter(item => {
    // Filtro por disponibilidad
    if (!item.available) return false;

    // Filtro por categoría
    if (selectedCategory && item.category_id !== selectedCategory) return false;
    
    // Filtro por término de búsqueda
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setSearchTerm('');
  };

  const handleItemClick = (itemId: string) => {
    if (activeItemId === itemId) {
      setActiveItemId(null);
      setSelectedOptions({});
      setItemNotes('');
      setAdditionalItems([]);
      setAdditionalItemText('');
    } else {
      const item = menuItems.find(i => i.id === itemId);
      if (item && item.options) {
        const initialOptions = {};
        item.options.forEach(option => {
          initialOptions[option.name] = '';
        });
        setSelectedOptions(initialOptions);
      }
      setActiveItemId(itemId);
      setItemNotes('');
      setAdditionalItems([]);
      setAdditionalItemText('');
    }
  };

  const handleOptionSelect = (optionName: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: optionId
    }));
  };

  const handleAddAdditionalItem = () => {
    if (additionalItemText.trim()) {
      setAdditionalItems(prev => [...prev, additionalItemText.trim()]);
      setAdditionalItemText('');
    }
  };

  const handleRemoveAdditionalItem = (index: number) => {
    setAdditionalItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = (item: ExtendedMenuItem) => {
    // Si el ítem está activo y tiene opciones, verificar que todas estén seleccionadas
    if (activeItemId === item.id && item.options && item.options.length > 0) {
      const allOptionsSelected = item.options.every(option => selectedOptions[option.name]);
      
      if (!allOptionsSelected) {
        // Alerta: seleccionar todas las opciones
        toast({
          title: "Opciones incompletas",
          description: "Por favor selecciona todas las opciones requeridas",
          variant: "destructive"
        });
        return;
      }
    }

    // Preparar las opciones seleccionadas
    const itemOptions = item.options ? item.options.map(option => {
      const selectedOptionId = selectedOptions[option.name];
      const selectedChoice = option.choices.find(choice => choice.id === selectedOptionId);
      
      return {
        name: option.name,
        choice: selectedChoice || option.choices[0] // Si no hay selección, usar la primera opción
      };
    }) : [];

    // Preparar las notas con elementos adicionales
    let notes = itemNotes.trim();
    if (additionalItems.length > 0) {
      notes += notes ? '\n' : '';
      notes += 'Adicionales: ' + additionalItems.join(', ');
    }

    // Crear el ítem para el carrito
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`, // ID único para el carrito
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      options: itemOptions,
      notes: notes || undefined
    };

    // Añadir al carrito
    onAddToCart(cartItem);

    // Reiniciar estados
    setActiveItemId(null);
    setSelectedOptions({});
    setItemNotes('');
    setAdditionalItems([]);
    setAdditionalItemText('');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar platos, ingredientes..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categorías */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.id)}
            className="rounded-full"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Lista de Platos */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`border rounded-lg overflow-hidden ${
                activeItemId === item.id ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              {/* Cabecera del ítem */}
              <div
                className="p-3 bg-white dark:bg-gray-900 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleItemClick(item.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>Contiene: {item.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                    {activeItemId !== item.id ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    ) : (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </div>

              {/* Opciones y detalles cuando está expandido */}
              {activeItemId === item.id && (
                <div className="p-3 border-t border-border bg-muted/20">
                  {item.options && item.options.length > 0 && (
                    <div className="space-y-3">
                      {item.options.map((option, idx) => (
                        <div key={idx}>
                          <h4 className="text-sm font-medium mb-2">{option.name}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {option.choices.map(choice => (
                              <Button
                                key={choice.id}
                                variant={selectedOptions[option.name] === choice.id ? "default" : "outline"}
                                size="sm"
                                className="justify-between"
                                onClick={() => handleOptionSelect(option.name, choice.id)}
                              >
                                <span>{choice.name}</span>
                                {choice.price > 0 && (
                                  <span className="text-xs ml-1">+${choice.price.toFixed(2)}</span>
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Adicionales */}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Adicionales</h4>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Agregar ingrediente o extra..."
                        value={additionalItemText}
                        onChange={(e) => setAdditionalItemText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAdditionalItem();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={handleAddAdditionalItem}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {additionalItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {additionalItems.map((item, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1"
                          >
                            <Tag className="h-3 w-3" />
                            {item}
                            <button 
                              className="ml-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleRemoveAdditionalItem(index)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notas */}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Notas especiales</h4>
                    <Input
                      placeholder="Ej. Sin cebolla, salsa aparte..."
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleAddToCart(item)}>
                      Añadir al pedido
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron platos que coincidan con tu búsqueda</p>
            <p className="text-sm mt-1">Intenta con otra búsqueda o categoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItems;
