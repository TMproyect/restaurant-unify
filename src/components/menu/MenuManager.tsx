import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pencil, Trash, Plus, Search, Tag, DollarSign, Check, X, Coffee, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMenuItems, MenuItem } from '@/services/menu/menuItemService';
import MenuItemForm from './MenuItemForm';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MenuCategory } from '@/services/menu/categoryService';
import { formatCurrency } from '@/utils/formatters';
import { deleteMenuItemWithConfirmation } from '@/integrations/menuItemIntegration';

interface MenuManagerProps {
  categories: MenuCategory[];
  isLoading: boolean;
}

const MenuManager: React.FC<MenuManagerProps> = ({ categories, isLoading: categoriesLoading }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('grid');

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const items = await fetchMenuItems();
      setMenuItems(items);
      applyFilters(items, searchTerm, categoryFilter, availabilityFilter);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Error al cargar los elementos del menú');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
    
    const handleMenuItemsUpdated = () => {
      loadMenuItems();
    };
    
    window.addEventListener('menuItemsUpdated', handleMenuItemsUpdated);
    
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuItemsUpdated);
    };
  }, []);

  useEffect(() => {
    applyFilters(menuItems, searchTerm, categoryFilter, availabilityFilter);
  }, [searchTerm, categoryFilter, availabilityFilter, menuItems]);

  const applyFilters = (
    items: MenuItem[], 
    search: string, 
    category: string, 
    availability: string
  ) => {
    let result = [...items];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower) ||
        (item.sku && item.sku.toLowerCase().includes(searchLower))
      );
    }
    
    if (category && category !== 'all') {
      result = result.filter(item => item.category_id === category);
    }
    
    if (availability === 'available') {
      result = result.filter(item => item.available);
    } else if (availability === 'unavailable') {
      result = result.filter(item => !item.available);
    }
    
    setFilteredItems(result);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    const success = await deleteMenuItemWithConfirmation(id);
    if (success) {
      loadMenuItems();
    }
  };

  const handleFormClose = (itemSaved: boolean) => {
    setShowForm(false);
    if (itemSaved) {
      loadMenuItems();
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <div className="aspect-video bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter className="p-4 flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </CardFooter>
      </Card>
    ));
  };

  const renderGridView = () => {
    if (loading || categoriesLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderSkeletons()}
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-10">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay elementos</h3>
          <p className="text-muted-foreground">
            No se encontraron elementos que coincidan con los filtros aplicados.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.image_url ? (
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
                {item.popular && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">Popular</Badge>
                )}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">No Disponible</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <Coffee className="h-10 w-10 text-muted-foreground" />
                {item.popular && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">Popular</Badge>
                )}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">No Disponible</Badge>
                  </div>
                )}
              </div>
            )}
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge variant="outline">{formatCurrency(item.price)}</Badge>
              </div>
              <Badge variant="secondary" className="mt-1">
                {getCategoryName(item.category_id)}
              </Badge>
              {item.sku && (
                <Badge variant="outline" className="mt-1 text-xs">
                  SKU: {item.sku}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">Alérgenos:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.allergens.map((allergen) => (
                      <Badge key={allergen} variant="outline" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditItem(item)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (loading || categoriesLoading) {
      return (
        <div className="rounded-md border">
          <div className="p-4">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-10">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay elementos</h3>
          <p className="text-muted-foreground">
            No se encontraron elementos que coincidan con los filtros aplicados.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Nombre</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Categoría</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Precio</th>
                <th className="h-12 px-4 text-left align-middle font-medium">SKU</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Disponible</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Popular</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">{item.name}</td>
                  <td className="p-4 align-middle">{getCategoryName(item.category_id)}</td>
                  <td className="p-4 align-middle">{formatCurrency(item.price)}</td>
                  <td className="p-4 align-middle">{item.sku || '-'}</td>
                  <td className="p-4 align-middle">
                    {item.available ? (
                      <Badge variant="success" className="flex items-center gap-1 w-fit">
                        <Check className="h-3 w-3" /> Sí
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <X className="h-3 w-3" /> No
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {item.popular ? (
                      <Badge variant="success" className="flex items-center gap-1 w-fit">
                        <Check className="h-3 w-3" /> Sí
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <X className="h-3 w-3" /> No
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditItem(item)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-4">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="unavailable">No disponibles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Plato
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Vista Cuadrícula</TabsTrigger>
            <TabsTrigger value="table">Vista Tabla</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        {activeTab === 'grid' ? renderGridView() : renderTableView()}
      </div>

      {showForm && (
        <MenuItemForm
          categories={categories}
          item={editingItem}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default MenuManager;
