
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  PlusCircle, 
  Pencil, 
  Trash2,
  Coffee,
  Utensils,
  Wine,
  IceCream,
  Pizza,
  Salad,
  ChefHat,
  Sandwich,
  CupSoda,
  Cake,
  Fish,
  Soup,
  Croissant
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  MenuCategory, 
  fetchMenuCategories, 
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory
} from '@/services/menuService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryManagerProps {
  onCategoriesUpdated: () => void;
}

// Objeto de mapeo de iconos por nombre
const categoryIcons: Record<string, React.ReactNode> = {
  bebidas: <Coffee className="h-4 w-4" />,
  platos: <Utensils className="h-4 w-4" />,
  vinos: <Wine className="h-4 w-4" />,
  postres: <IceCream className="h-4 w-4" />,
  pizzas: <Pizza className="h-4 w-4" />,
  ensaladas: <Salad className="h-4 w-4" />,
  menu: <ChefHat className="h-4 w-4" />,
  sandwich: <Sandwich className="h-4 w-4" />,
  refrescos: <CupSoda className="h-4 w-4" />,
  pasteles: <Cake className="h-4 w-4" />,
  pescados: <Fish className="h-4 w-4" />,
  sopas: <Soup className="h-4 w-4" />,
  panaderia: <Croissant className="h-4 w-4" />
};

// Opciones de iconos para seleccionar
const iconOptions = [
  { value: 'bebidas', label: 'Bebidas', icon: <Coffee className="h-4 w-4" /> },
  { value: 'platos', label: 'Platos', icon: <Utensils className="h-4 w-4" /> },
  { value: 'vinos', label: 'Vinos', icon: <Wine className="h-4 w-4" /> },
  { value: 'postres', label: 'Postres', icon: <IceCream className="h-4 w-4" /> },
  { value: 'pizzas', label: 'Pizzas', icon: <Pizza className="h-4 w-4" /> },
  { value: 'ensaladas', label: 'Ensaladas', icon: <Salad className="h-4 w-4" /> },
  { value: 'menu', label: 'Menú General', icon: <ChefHat className="h-4 w-4" /> },
  { value: 'sandwich', label: 'Sandwiches', icon: <Sandwich className="h-4 w-4" /> },
  { value: 'refrescos', label: 'Refrescos', icon: <CupSoda className="h-4 w-4" /> },
  { value: 'pasteles', label: 'Pasteles', icon: <Cake className="h-4 w-4" /> },
  { value: 'pescados', label: 'Pescados', icon: <Fish className="h-4 w-4" /> },
  { value: 'sopas', label: 'Sopas', icon: <Soup className="h-4 w-4" /> },
  { value: 'panaderia', label: 'Panadería', icon: <Croissant className="h-4 w-4" /> }
];

const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoriesUpdated }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('menu');
  const [editingCategory, setEditingCategory] = useState<MenuCategory & { icon?: string } | null>(null);
  const { toast } = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await fetchMenuCategories();
      console.log('Categorías cargadas:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    try {
      const categoryData = {
        name: newCategoryName,
        icon: newCategoryIcon // Almacenamos el ícono como metadata
      };
      await createMenuCategory(categoryData);
      toast({
        title: "Categoría creada",
        description: `La categoría "${newCategoryName}" ha sido creada exitosamente`
      });
      setNewCategoryName('');
      setNewCategoryIcon('menu');
      setIsAddDialogOpen(false);
      await loadCategories();
      onCategoriesUpdated();
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateMenuCategory(editingCategory.id, { 
        name: editingCategory.name,
        icon: editingCategory.icon 
      });
      toast({
        title: "Categoría actualizada",
        description: `La categoría ha sido actualizada exitosamente`
      });
      setIsEditDialogOpen(false);
      await loadCategories();
      onCategoriesUpdated();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Esta acción también eliminará todos los productos asociados.")) {
      return;
    }

    try {
      await deleteMenuCategory(id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente"
      });
      await loadCategories();
      onCategoriesUpdated();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive"
      });
    }
  };

  // Determinar icono para una categoría
  const getCategoryIcon = (category: MenuCategory) => {
    // Si la categoría tiene un ícono almacenado, usamos ese
    if ((category as any).icon && categoryIcons[(category as any).icon]) {
      return categoryIcons[(category as any).icon];
    }
    
    // Si no, intentamos encontrar un ícono según el nombre
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (category.name.toLowerCase().includes(key)) {
        return icon;
      }
    }
    
    // Icono por defecto
    return <ChefHat className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Categoría</DialogTitle>
              <DialogDescription>
                Crea una nueva categoría para organizar tus productos del menú.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryName">Nombre de la Categoría</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Postres, Bebidas, etc."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="categoryIcon">Icono</Label>
                <Select
                  value={newCategoryIcon}
                  onValueChange={setNewCategoryIcon}
                >
                  <SelectTrigger id="categoryIcon" className="w-full">
                    <SelectValue placeholder="Selecciona un icono" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="flex items-center">
                        <div className="flex items-center">
                          {option.icon}
                          <span className="ml-2">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleCreateCategory}>
                Añadir Categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando categorías...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  {getCategoryIcon(category)}
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-end space-x-2 pt-2">
                <Dialog open={isEditDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                  if (open) {
                    setEditingCategory({
                      ...category,
                      icon: (category as any).icon || 'menu'
                    });
                  } else {
                    setIsEditDialogOpen(false);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => {
                      setEditingCategory({
                        ...category,
                        icon: (category as any).icon || 'menu'
                      });
                      setIsEditDialogOpen(true);
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Categoría</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="editCategoryName">Nombre de la Categoría</Label>
                        <Input
                          id="editCategoryName"
                          value={editingCategory?.name || ''}
                          onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                          placeholder="Nombre de la categoría"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="editCategoryIcon">Icono</Label>
                        <Select
                          value={editingCategory?.icon || 'menu'}
                          onValueChange={(value) => setEditingCategory(prev => prev ? { ...prev, icon: value } : null)}
                        >
                          <SelectTrigger id="editCategoryIcon" className="w-full">
                            <SelectValue placeholder="Selecciona un icono" />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="flex items-center">
                                <div className="flex items-center">
                                  {option.icon}
                                  <span className="ml-2">{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button onClick={handleEditCategory}>
                        Guardar Cambios
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay categorías creadas</p>
          <p className="text-sm mt-1">Crea categorías para organizar tu menú</p>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
