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
import { 
  MenuItem, 
  MenuCategory, 
  fetchMenuItems, 
  fetchMenuCategories, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  uploadMenuItemImage
} from '@/services/menuService';

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

const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<ExtendedMenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<ExtendedMenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Form state for adding/editing menu items
  const [editingItem, setEditingItem] = useState<ExtendedMenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ExtendedMenuItem>>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    available: true,
    allergens: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Fetch menu items and categories from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [itemsData, categoriesData] = await Promise.all([
          fetchMenuItems(),
          fetchMenuCategories()
        ]);
        
        setMenuItems(itemsData as ExtendedMenuItem[]);
        setFilteredItems(itemsData as ExtendedMenuItem[]);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading menu data:', error);
        toast({
          title: "Error de carga",
          description: "No se pudieron cargar los datos del menú",
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
  
  // Filter menu items when search term or category changes
  useEffect(() => {
    let filtered = menuItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }
    
    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);
  
  // Reset form fields
  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category_id: '',
      available: true,
      allergens: [],
    });
    setImageFile(null);
  };
  
  // Handle adding a new menu item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category_id) {
      toast({
        title: "Error al guardar",
        description: "Por favor complete el nombre y seleccione una categoría",
        variant: "destructive"
      });
      return;
    }
    
    // Handle image upload if provided
    let imageUrl = newItem.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadMenuItemImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const itemToAdd = {
      name: newItem.name,
      description: newItem.description || '',
      price: newItem.price || 0,
      category_id: newItem.category_id,
      available: newItem.available !== undefined ? newItem.available : true,
      popular: newItem.popular || false,
      allergens: newItem.allergens || [],
      image_url: imageUrl
    };
    
    const createdItem = await createMenuItem(itemToAdd);
    
    if (createdItem) {
      setMenuItems(prev => [...prev, createdItem as ExtendedMenuItem]);
      
      toast({
        title: "Plato añadido",
        description: `${createdItem.name} ha sido añadido al menú`
      });
      
      // Close dialog if requested
      setIsAddDialogOpen(false);
      resetForm();
    }
  };
  
  // Handle adding and staying in dialog to add more
  const handleAddAndContinue = async () => {
    if (!newItem.name || !newItem.category_id) {
      toast({
        title: "Error al guardar",
        description: "Por favor complete el nombre y seleccione una categoría",
        variant: "destructive"
      });
      return;
    }
    
    // Handle image upload if provided
    let imageUrl = newItem.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadMenuItemImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const itemToAdd = {
      name: newItem.name,
      description: newItem.description || '',
      price: newItem.price || 0,
      category_id: newItem.category_id,
      available: newItem.available !== undefined ? newItem.available : true,
      popular: newItem.popular || false,
      allergens: newItem.allergens || [],
      image_url: imageUrl
    };
    
    const createdItem = await createMenuItem(itemToAdd);
    
    if (createdItem) {
      setMenuItems(prev => [...prev, createdItem as ExtendedMenuItem]);
      
      // Reset form but keep dialog open for adding more
      resetForm();
      
      toast({
        title: "Plato añadido",
        description: `${createdItem.name} ha sido añadido al menú`
      });
    }
  };
  
  // Handle editing a menu item
  const handleEditItem = (item: ExtendedMenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      available: item.available,
      popular: item.popular,
      allergens: item.allergens,
      image_url: item.image_url
    });
    setImageFile(null);
    setIsEditDialogOpen(true);
  };
  
  // Handle saving edited menu item
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    // Handle image upload if provided
    let imageUrl = newItem.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadMenuItemImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const updates = {
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      category_id: newItem.category_id,
      available: newItem.available,
      popular: newItem.popular,
      allergens: newItem.allergens,
      image_url: imageUrl
    };
    
    const updatedItem = await updateMenuItem(editingItem.id, updates);
    
    if (updatedItem) {
      setMenuItems(prev => 
        prev.map(item => 
          item.id === editingItem.id ? { ...updatedItem, options: item.options } as ExtendedMenuItem : item
        )
      );
      
      setEditingItem(null);
      setIsEditDialogOpen(false);
      
      // Reset form
      resetForm();
      
      toast({
        title: "Plato actualizado",
        description: `${updatedItem.name} ha sido actualizado`
      });
    }
  };
  
  // Handle deleting a menu item
  const handleDeleteItem = async (id: string) => {
    const itemToDelete = menuItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const success = await deleteMenuItem(id);
    
    if (success) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Plato eliminado",
        description: `${itemToDelete.name} ha sido eliminado del menú`
      });
    }
  };
  
  // Handle toggling availability
  const handleToggleAvailability = async (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;
    
    const updatedItem = await updateMenuItem(id, { available: !item.available });
    
    if (updatedItem) {
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id ? { ...updatedItem, options: item.options } as ExtendedMenuItem : item
        )
      );
      
      toast({
        title: updatedItem.available ? "Plato disponible" : "Plato no disponible",
        description: `${updatedItem.name} ahora está ${updatedItem.available ? 'disponible' : 'no disponible'}`
      });
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    toast({
      title: "Imagen seleccionada",
      description: "La imagen será subida al guardar el plato"
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión del Menú</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Plato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Añadir Nuevo Plato
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
                    value={newItem.category_id || ''}
                    onValueChange={(value) => setNewItem({ ...newItem, category_id: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
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
                  <div className="relative flex-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full flex justify-start text-muted-foreground"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {imageFile ? imageFile.name : "Seleccionar archivo"}
                    </Button>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </div>
                </div>
                {(newItem.image_url || imageFile) && (
                  <p className="text-xs text-muted-foreground">
                    {imageFile 
                      ? `Imagen seleccionada: ${imageFile.name}` 
                      : `Imagen actual: ${newItem.image_url?.split('/').pop()}`}
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
            
            <DialogFooter className="flex justify-between sm:justify-end">
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAndContinue}>
                  Guardar y Crear otro
                </Button>
                <Button onClick={handleAddItem}>
                  Guardar
                </Button>
              </div>
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
          value={selectedCategory || "all"}
          onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las categorías" />
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
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando menú...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className={item.available ? "" : "opacity-60"}>
              {item.image_url && (
                <div className="w-full">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="rounded-t-lg w-full h-44 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
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
                        {categories.find(c => c.id === item.category_id)?.name || 'Sin categoría'}
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
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEditItem(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Plato
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Nombre del plato"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Descripción del plato"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={newItem.price || 0}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Select
                  value={newItem.category_id || ''}
                  onValueChange={(value) => setNewItem({ ...newItem, category_id: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
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
                <Label htmlFor="edit-available">Disponibilidad</Label>
                <Select
                  value={newItem.available ? "true" : "false"}
                  onValueChange={(value) => setNewItem({ ...newItem, available: value === "true" })}
                >
                  <SelectTrigger id="edit-available">
                    <SelectValue placeholder="Disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Disponible</SelectItem>
                    <SelectItem value="false">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-popular">Popular</Label>
                <Select
                  value={newItem.popular ? "true" : "false"}
                  onValueChange={(value) => setNewItem({ ...newItem, popular: value === "true" })}
                >
                  <SelectTrigger id="edit-popular">
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
              <Label htmlFor="edit-image">Imagen</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex justify-start text-muted-foreground"
                    onClick={() => document.getElementById('edit-image')?.click()}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    {imageFile ? imageFile.name : "Seleccionar archivo"}
                  </Button>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </div>
              </div>
              {(newItem.image_url || imageFile) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {imageFile 
                      ? `Nueva imagen seleccionada: ${imageFile.name}` 
                      : `Imagen actual: ${newItem.image_url?.split('/').pop()}`}
                  </p>
                  {newItem.image_url && !imageFile && (
                    <img 
                      src={newItem.image_url} 
                      alt="Imagen actual" 
                      className="h-32 object-contain rounded border border-border"
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-allergens">Alérgenos (separados por coma)</Label>
              <Input
                id="edit-allergens"
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManager;

