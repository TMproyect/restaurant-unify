
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Search,
  ImagePlus,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { menuCategories, MenuItem } from '@/data/menuData';

// Function to get menu items from localStorage or sample data
const getMenuItems = (): MenuItem[] => {
  const savedItems = localStorage.getItem('restaurantMenuItems');
  if (savedItems) {
    return JSON.parse(savedItems);
  }
  
  // If no saved items, import from menuData
  const { menuItems } = require('@/data/menuData');
  return menuItems;
};

// Function to save menu items to localStorage
const saveMenuItems = (items: MenuItem[]) => {
  localStorage.setItem('restaurantMenuItems', JSON.stringify(items));
  // Dispatch a custom event to notify other components about the update
  window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
};

const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Form state for adding/editing menu items
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'entradas',
    available: true,
    allergens: [],
  });
  
  // Initialize menu items from localStorage or sample data
  useEffect(() => {
    setMenuItems(getMenuItems());
    setFilteredItems(getMenuItems());
    setIsLoading(false);
    
    // Listen for menu updates from other components
    const handleMenuUpdated = () => {
      setMenuItems(getMenuItems());
      setFilteredItems(getMenuItems());
    };
    
    window.addEventListener('menuItemsUpdated', handleMenuUpdated);
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdated);
    };
  }, []);
  
  // Filter menu items when search term or category changes
  useEffect(() => {
    let filtered = menuItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);
  
  // Handle adding a new menu item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || !newItem.category) {
      toast({
        title: "Error al guardar",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    const newId = `${Date.now()}`;
    const itemToAdd: MenuItem = {
      id: newId,
      name: newItem.name || '',
      description: newItem.description || '',
      price: newItem.price || 0,
      category: newItem.category || 'entradas',
      available: newItem.available !== undefined ? newItem.available : true,
      popular: newItem.popular || false,
      allergens: newItem.allergens || [],
      options: newItem.options || [],
      image: newItem.image || undefined
    };
    
    const updatedItems = [...menuItems, itemToAdd];
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
    
    // Reset form
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: 'entradas',
      available: true,
      allergens: [],
    });
    
    toast({
      title: "Plato añadido",
      description: `${itemToAdd.name} ha sido añadido al menú`
    });
  };
  
  // Handle editing a menu item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      popular: item.popular,
      allergens: item.allergens,
      options: item.options,
      image: item.image
    });
  };
  
  // Handle saving edited menu item
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const updatedItems = menuItems.map(item => 
      item.id === editingItem.id
        ? {
            ...item,
            name: newItem.name || item.name,
            description: newItem.description || item.description,
            price: newItem.price !== undefined ? newItem.price : item.price,
            category: newItem.category || item.category,
            available: newItem.available !== undefined ? newItem.available : item.available,
            popular: newItem.popular !== undefined ? newItem.popular : item.popular,
            allergens: newItem.allergens || item.allergens,
            options: newItem.options || item.options,
            image: newItem.image || item.image
          }
        : item
    );
    
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
    setEditingItem(null);
    
    // Reset form
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: 'entradas',
      available: true,
      allergens: [],
    });
    
    toast({
      title: "Plato actualizado",
      description: `${newItem.name} ha sido actualizado`
    });
  };
  
  // Handle deleting a menu item
  const handleDeleteItem = (id: string) => {
    const itemToDelete = menuItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const updatedItems = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
    
    toast({
      title: "Plato eliminado",
      description: `${itemToDelete.name} ha sido eliminado del menú`
    });
  };
  
  // Handle toggling availability
  const handleToggleAvailability = (id: string) => {
    const updatedItems = menuItems.map(item => 
      item.id === id
        ? { ...item, available: !item.available }
        : item
    );
    
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
    
    const updatedItem = updatedItems.find(item => item.id === id);
    if (updatedItem) {
      toast({
        title: updatedItem.available ? "Plato disponible" : "Plato no disponible",
        description: `${updatedItem.name} ahora está ${updatedItem.available ? 'disponible' : 'no disponible'}`
      });
    }
  };
  
  // Mock function for handling image upload
  // In a real implementation, this would upload to Supabase storage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Mock image URL - in a real implementation, this would be the Supabase URL
    const mockImageUrl = `https://example.com/images/${file.name}`;
    
    setNewItem({
      ...newItem,
      image: mockImageUrl
    });
    
    toast({
      title: "Imagen subida",
      description: "La imagen ha sido subida correctamente"
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión del Menú</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Plato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Plato' : 'Añadir Nuevo Plato'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Nombre del plato"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Descripción del plato"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price || 0}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newItem.category || 'entradas'}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="available">Disponibilidad</Label>
                  <Select
                    value={newItem.available ? "true" : "false"}
                    onValueChange={(value) => setNewItem({ ...newItem, available: value === "true" })}
                  >
                    <SelectTrigger id="available">
                      <SelectValue placeholder="Disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Disponible</SelectItem>
                      <SelectItem value="false">No disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="popular">Popular</Label>
                  <Select
                    value={newItem.popular ? "true" : "false"}
                    onValueChange={(value) => setNewItem({ ...newItem, popular: value === "true" })}
                  >
                    <SelectTrigger id="popular">
                      <SelectValue placeholder="¿Es popular?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="image">Imagen</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {newItem.image && (
                  <p className="text-xs text-muted-foreground">
                    Imagen seleccionada: {newItem.image.split('/').pop()}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="allergens">Alérgenos (separados por coma)</Label>
                <Input
                  id="allergens"
                  value={newItem.allergens?.join(', ') || ''}
                  onChange={(e) => setNewItem({ 
                    ...newItem, 
                    allergens: e.target.value.split(',').map(item => item.trim()).filter(Boolean) 
                  })}
                  placeholder="lácteos, gluten, frutos secos..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={editingItem ? handleSaveEdit : handleAddItem}>
                {editingItem ? 'Guardar Cambios' : 'Añadir Plato'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center space-x-2 pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar platos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory || ""}
          onValueChange={(value) => setSelectedCategory(value === "" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {menuCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando menú...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className={item.available ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg mr-2">{item.name}</CardTitle>
                  {item.popular && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {menuCategories.find(c => c.id === item.category)?.name || item.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="flex items-center text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>{item.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleAvailability(item.id)}
                >
                  {item.available ? 'Deshabilitar' : 'Habilitar'}
                </Button>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleEditItem(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No se encontraron platos</p>
          <p className="text-sm mt-1">Intenta con otra búsqueda o añade nuevos platos</p>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
