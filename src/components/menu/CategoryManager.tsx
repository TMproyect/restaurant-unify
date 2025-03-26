
import React, { useState } from 'react';
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
} from '@/components/ui/dialog';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  MenuCategory, 
  fetchMenuCategories, 
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory
} from '@/services/menuService';

interface CategoryManagerProps {
  categories: MenuCategory[];
  onCategoriesUpdated: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onCategoriesUpdated }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const { toast } = useToast();

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
      await createMenuCategory({ name: newCategoryName });
      toast({
        title: "Categoría creada",
        description: `La categoría "${newCategoryName}" ha sido creada exitosamente`
      });
      setNewCategoryName('');
      setIsAddDialogOpen(false);
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
      await updateMenuCategory(editingCategory.id, { name: editingCategory.name });
      toast({
        title: "Categoría actualizada",
        description: `La categoría ha sido actualizada exitosamente`
      });
      setIsEditDialogOpen(false);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end space-x-2">
              <Dialog open={isEditDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                if (open) {
                  setEditingCategory(category);
                } else {
                  setIsEditDialogOpen(false);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => {
                    setEditingCategory(category);
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
      
      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay categorías creadas</p>
          <p className="text-sm mt-1">Crea categorías para organizar tu menú</p>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
