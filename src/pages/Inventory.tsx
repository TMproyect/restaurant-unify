
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchInventoryItems, 
  fetchInventoryCategories, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  updateInventoryItemStock,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
  InventoryItem,
  InventoryCategory
} from '@/services/inventoryService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Inventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category_id: '',
    stock_quantity: 0,
    min_stock_level: 0,
    unit: 'kg'
  });
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // For category management
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  
  // Fetch inventory items
  const { 
    data: inventoryItems = [], 
    isLoading: itemsLoading, 
    error: itemsError,
  } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: fetchInventoryItems
  });
  
  // Fetch inventory categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['inventoryCategories'],
    queryFn: fetchInventoryCategories
  });
  
  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      setIsAddDialogOpen(false);
      setNewItem({
        name: '',
        category_id: '',
        stock_quantity: 0,
        min_stock_level: 0,
        unit: 'kg'
      });
      setEditingItem(null);
      toast({
        title: "Producto añadido",
        description: `${newItem.name} ha sido añadido al inventario`
      });
    },
    onError: (error) => {
      console.error('Error creating item:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el producto en el inventario",
        variant: "destructive"
      });
    }
  });
  
  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<InventoryItem> }) => 
      updateInventoryItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      setIsAddDialogOpen(false);
      setNewItem({
        name: '',
        category_id: '',
        stock_quantity: 0,
        min_stock_level: 0,
        unit: 'kg'
      });
      setEditingItem(null);
      toast({
        title: "Producto actualizado",
        description: `El producto ha sido actualizado exitosamente`
      });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el producto",
        variant: "destructive"
      });
    }
  });
  
  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del inventario"
      });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el producto del inventario",
        variant: "destructive"
      });
    }
  });
  
  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ id, newQuantity }: { id: string, newQuantity: number }) => 
      updateInventoryItemStock(id, newQuantity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: "Stock actualizado",
        description: `${data.name}: ${data.stock_quantity} ${data.unit || 'unidades'}`
      });
    },
    onError: (error) => {
      console.error('Error updating stock:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el stock del producto",
        variant: "destructive"
      });
    }
  });
  
  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createInventoryCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCategories'] });
      setNewCategoryName('');
      setEditingCategory(null);
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente"
      });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: "Error al crear",
        description: "No se pudo crear la categoría",
        variant: "destructive"
      });
    }
  });
  
  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string, name: string }) => 
      updateInventoryCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCategories'] });
      setNewCategoryName('');
      setEditingCategory(null);
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente"
      });
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar la categoría",
        variant: "destructive"
      });
    }
  });
  
  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteInventoryCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCategories'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente"
      });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la categoría",
        variant: "destructive"
      });
    }
  });
  
  // Filter items based on search term and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      (item.category && item.category.id === categoryFilter);
    return matchesSearch && matchesCategory;
  });
    
  // Calculate stats
  const totalItems = inventoryItems.length;
  const outOfStockItems = inventoryItems.filter(item => item.stock_quantity <= 0).length;
  const lowStockItems = inventoryItems.filter(item => 
    item.stock_quantity > 0 && 
    item.min_stock_level && 
    item.stock_quantity < item.min_stock_level
  ).length;
  
  // Render alert banner for low stock items
  const renderAlertBanner = () => {
    const alertItems = inventoryItems.filter(item => 
      item.min_stock_level && 
      item.stock_quantity < item.min_stock_level && 
      item.stock_quantity > 0
    );
    
    if (alertItems.length === 0) return null;
    
    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
          <h3 className="text-amber-800 font-medium">
            Alerta de Inventario: {alertItems.length} productos con stock bajo
          </h3>
        </div>
        <div className="mt-2 text-sm text-amber-700 space-y-1">
          {alertItems.slice(0, 3).map(item => (
            <p key={item.id}>
              • {item.name}: {item.stock_quantity} {item.unit} (Mínimo: {item.min_stock_level} {item.unit})
            </p>
          ))}
          {alertItems.length > 3 && (
            <p>• Y {alertItems.length - 3} productos más...</p>
          )}
        </div>
      </div>
    );
  };

  // Handle form submission for new/edited item
  const handleSubmit = async () => {
    try {
      // Validation
      if (!newItem.name || newItem.stock_quantity === undefined) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        });
        return;
      }

      if (editingItem) {
        // Update existing item
        updateItemMutation.mutate({ 
          id: editingItem.id, 
          updates: newItem 
        });
      } else {
        // Create new item
        createItemMutation.mutate(newItem as Omit<InventoryItem, 'id' | 'created_at'>);
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el producto en el inventario",
        variant: "destructive"
      });
    }
  };

  // Handle category form submission
  const handleCategorySubmit = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        name: newCategoryName
      });
    } else {
      createCategoryMutation.mutate(newCategoryName);
    }
    
    setIsCategoryDialogOpen(false);
  };

  // Edit item
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category_id: item.category_id || '',
      stock_quantity: item.stock_quantity,
      min_stock_level: item.min_stock_level || 0,
      unit: item.unit || 'kg'
    });
    setIsAddDialogOpen(true);
  };

  // Delete item
  const handleDelete = async (id: string) => {
    try {
      deleteItemMutation.mutate(id);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  // Update stock quantity
  const handleUpdateStock = async (id: string, amount: number) => {
    try {
      const item = inventoryItems.find(item => item.id === id);
      if (!item) return;
      
      const newQuantity = item.stock_quantity + amount;
      if (newQuantity < 0) return;
      
      updateStockMutation.mutate({ id, newQuantity });
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  // Edit category
  const handleEditCategory = (category: InventoryCategory) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsCategoryDialogOpen(true);
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  if (itemsError) {
    toast({
      title: "Error al cargar inventario",
      description: "No se pudo obtener los datos del inventario",
      variant: "destructive"
    });
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventario</h1>
          
          <div className="flex space-x-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus size={18} className="mr-2" /> Categoría</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoría' : 'Añadir Nueva Categoría'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory 
                      ? 'Modifica los detalles de la categoría seleccionada.' 
                      : 'Crea una nueva categoría para organizar tus productos de inventario.'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoryName">Nombre de la categoría</Label>
                    <Input
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre de categoría"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleCategorySubmit}>
                    {editingCategory ? 'Guardar Cambios' : 'Añadir Categoría'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={18} className="mr-2" /> Añadir Producto</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={newItem.name || ''}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unidad</Label>
                      <Select
                        value={newItem.unit || 'kg'}
                        onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                      >
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="unidad">unidad</SelectItem>
                          <SelectItem value="paquete">paquete</SelectItem>
                          <SelectItem value="caja">caja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock actual</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newItem.stock_quantity || 0}
                        onChange={(e) => setNewItem({ ...newItem, stock_quantity: parseInt(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="minStock">Stock mínimo</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={newItem.min_stock_level || 0}
                        onChange={(e) => setNewItem({ ...newItem, min_stock_level: parseInt(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit}>
                    {editingItem ? 'Guardar Cambios' : 'Añadir Producto'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {renderAlertBanner()}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Total Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Productos Agotados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{outOfStockItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <p className="text-2xl font-bold text-amber-500">{lowStockItems}</p>
              {lowStockItems > 0 && (
                <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{categories.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Categories section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Categorías de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="text-center py-4">Cargando categorías...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No hay categorías definidas. Crea una categoría para organizar tu inventario.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la categoría y puede afectar a los productos asignados a ella.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
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

        {itemsLoading ? (
          <div className="text-center py-8">
            <p>Cargando inventario...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => {
                // Determine row styling based on stock level
                let rowClassName = "";
                if (item.stock_quantity <= 0) {
                  rowClassName = "bg-red-50";
                } else if (item.min_stock_level && item.stock_quantity < item.min_stock_level) {
                  rowClassName = "bg-amber-50";
                }
                
                return (
                  <TableRow key={item.id} className={rowClassName}>
                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      {item.category ? item.category.name : 'Sin categoría'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateStock(item.id, -1)}
                          disabled={item.stock_quantity <= 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.stock_quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateStock(item.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.min_stock_level || 0} {item.unit || ''}
                    </TableCell>
                    <TableCell>
                      {item.stock_quantity <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Agotado
                        </span>
                      ) : item.min_stock_level && item.stock_quantity < item.min_stock_level ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Stock bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente {item.name} del inventario.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron productos</p>
            <p className="text-sm mt-1">Intenta con otra búsqueda o añade nuevos productos</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;
