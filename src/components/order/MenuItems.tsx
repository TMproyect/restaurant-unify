
import React, { useState } from 'react';
import { 
  Search, 
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MenuItem, menuItems, menuCategories } from '@/data/menuData';
import { CartItem } from './OrderCart';

interface MenuItemsProps {
  onAddToCart: (item: CartItem) => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [itemNotes, setItemNotes] = useState('');

  // Filtrar items del menú
  const filteredItems = menuItems.filter(item => {
    // Filtro por disponibilidad
    if (!item.available) return false;

    // Filtro por categoría
    if (selectedCategory && item.category !== selectedCategory) return false;
    
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
    }
  };

  const handleOptionSelect = (optionName: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: optionId
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    // Si el ítem está activo y tiene opciones, verificar que todas estén seleccionadas
    if (activeItemId === item.id && item.options) {
      const allOptionsSelected = item.options.every(option => selectedOptions[option.name]);
      
      if (!allOptionsSelected) {
        // Alerta: seleccionar todas las opciones
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

    // Crear el ítem para el carrito
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`, // ID único para el carrito
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      options: itemOptions,
      notes: itemNotes.trim() || undefined
    };

    // Añadir al carrito
    onAddToCart(cartItem);

    // Reiniciar estados
    setActiveItemId(null);
    setSelectedOptions({});
    setItemNotes('');
  };

  const getActiveItem = () => {
    return activeItemId ? menuItems.find(item => item.id === activeItemId) : null;
  };

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
        {menuCategories.map(category => (
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
