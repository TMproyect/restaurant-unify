
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchInventoryItems, InventoryItem } from '@/services/inventoryService';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { fetchInventoryCategories } from '@/services/inventoryService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Inventory = () => {
  const { toast } = useToast();
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
  
  // Fetch inventory items
  const { 
    data: inventoryItems = [], 
    isLoading: itemsLoading, 
    error: itemsError,
    refetch: refetchItems 
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

      // TODO: Add code to create/update item in Supabase
      // This will be implemented in the inventoryService
      
      // Reset form and refetch data
      setNewItem({
        name: '',
        category_id: '',
        stock_quantity: 0,
        min_stock_level: 0,
        unit: 'kg'
      });
      setEditingItem(null);
      refetchItems();
      
      toast({
        title: editingItem ? "Producto actualizado" : "Producto añadido",
        description: `${newItem.name} ha sido ${editingItem ? 'actualizado' : 'añadido'} al inventario`
      });
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el producto en el inventario",
        variant: "destructive"
      });
    }
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
  };

  // Delete item
  const handleDelete = async (id: string) => {
    try {
      // TODO: Add code to delete item from Supabase
      // This will be implemented in the inventoryService
      
      refetchItems();
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del inventario"
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el producto del inventario",
        variant: "destructive"
      });
    }
  };

  // Update stock quantity
  const handleUpdateStock = async (id: string, amount: number) => {
    try {
      const item = inventoryItems.find(item => item.id === id);
      if (!item) return;
      
      const newQuantity = item.stock_quantity + amount;
      if (newQuantity < 0) return;
      
      // TODO: Add code to update item stock in Supabase
      // This will be implemented in the inventoryService
      
      refetchItems();
      toast({
        title: "Stock actualizado",
        description: `${item.name}: ${newQuantity} ${item.unit || 'unidades'}`
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el stock del producto",
        variant: "destructive"
      });
    }
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
          
          <Dialog>
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
