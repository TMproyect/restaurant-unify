import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
  Filter,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Inventory item interface
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  price: string;
}

// Inventory categories
const inventoryCategories = [
  { id: "carnes", name: "Carnes" },
  { id: "vegetales", name: "Vegetales" },
  { id: "lacteos", name: "Lácteos" },
  { id: "condimentos", name: "Condimentos" },
  { id: "aceites", name: "Aceites" },
  { id: "panaderia", name: "Panadería" },
  { id: "bebidas", name: "Bebidas" },
  { id: "otros", name: "Otros" },
];

// Function to get inventory items from localStorage or sample data
const getInventoryItems = (): InventoryItem[] => {
  const savedItems = localStorage.getItem('restaurantInventoryItems');
  if (savedItems) {
    return JSON.parse(savedItems);
  }
  
  // Sample data if no saved items exist
  return [
    { id: 1, name: 'Pollo', category: 'Carnes', stock: 30, unit: 'kg', minStock: 10, price: '5,50 €' },
    { id: 2, name: 'Tomates', category: 'Vegetales', stock: 15, unit: 'kg', minStock: 20, price: '2,20 €' },
    { id: 3, name: 'Aceite de oliva', category: 'Aceites', stock: 45, unit: 'l', minStock: 10, price: '7,80 €' },
    { id: 4, name: 'Harina', category: 'Panadería', stock: 100, unit: 'kg', minStock: 30, price: '1,50 €' },
    { id: 5, name: 'Huevos', category: 'Lácteos', stock: 200, unit: 'unidad', minStock: 50, price: '0,25 €' },
    { id: 6, name: 'Queso mozzarella', category: 'Lácteos', stock: 8, unit: 'kg', minStock: 10, price: '10,30 €' },
    { id: 7, name: 'Ajo', category: 'Condimentos', stock: 5, unit: 'kg', minStock: 2, price: '4,25 €' },
    { id: 8, name: 'Sal', category: 'Condimentos', stock: 20, unit: 'kg', minStock: 5, price: '0,80 €' },
  ];
};

// Function to save inventory items to localStorage
const saveInventoryItems = (items: InventoryItem[]) => {
  localStorage.setItem('restaurantInventoryItems', JSON.stringify(items));
  // Dispatch a custom event to notify other components about the update
  window.dispatchEvent(new CustomEvent('inventoryItemsUpdated'));
};

const InventoryManager: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Form state for adding/editing inventory items
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'carnes',
    stock: 0,
    unit: 'kg',
    minStock: 0,
    price: '0,00 €',
  });
  
  // Calculate inventory stats
  const getInventoryStats = () => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => item.stock < item.minStock).length;
    const outOfStockItems = inventoryItems.filter(item => item.stock === 0).length;
    
    // Calculate total inventory value
    const totalValue = inventoryItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'));
      return total + (price * item.stock);
    }, 0);
    
    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue: totalValue.toFixed(2).replace('.', ',') + ' €'
    };
  };
  
  // Initialize inventory items from localStorage or sample data
  useEffect(() => {
    setInventoryItems(getInventoryItems());
    setFilteredItems(getInventoryItems());
    setIsLoading(false);
    
    // Listen for inventory updates from other components
    const handleInventoryUpdated = () => {
      setInventoryItems(getInventoryItems());
      setFilteredItems(getInventoryItems());
    };
    
    window.addEventListener('inventoryItemsUpdated', handleInventoryUpdated);
    return () => {
      window.removeEventListener('inventoryItemsUpdated', handleInventoryUpdated);
    };
  }, []);
  
  // Filter inventory items when search term or category changes
  useEffect(() => {
    let filtered = inventoryItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredItems(filtered);
  }, [inventoryItems, searchTerm, selectedCategory]);
  
  // Handle adding a new inventory item
  const handleAddItem = () => {
    if (!newItem.name || newItem.stock === undefined || newItem.minStock === undefined) {
      toast({
        title: "Error al guardar",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    const newId = Math.max(0, ...inventoryItems.map(item => item.id)) + 1;
    const itemToAdd: InventoryItem = {
      id: newId,
      name: newItem.name,
      category: newItem.category || 'otros',
      stock: newItem.stock,
      unit: newItem.unit || 'kg',
      minStock: newItem.minStock,
      price: newItem.price || '0,00 €',
    };
    
    const updatedItems = [...inventoryItems, itemToAdd];
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    // Reset form
    setNewItem({
      name: '',
      category: 'carnes',
      stock: 0,
      unit: 'kg',
      minStock: 0,
      price: '0,00 €',
    });
    
    toast({
      title: "Producto añadido",
      description: `${itemToAdd.name} ha sido añadido al inventario`
    });
  };
  
  // Handle editing an inventory item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      price: item.price,
    });
  };
  
  // Handle saving edited inventory item
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const updatedItems = inventoryItems.map(item => 
      item.id === editingItem.id
        ? {
            ...item,
            name: newItem.name || item.name,
            category: newItem.category || item.category,
            stock: newItem.stock !== undefined ? newItem.stock : item.stock,
            unit: newItem.unit || item.unit,
            minStock: newItem.minStock !== undefined ? newItem.minStock : item.minStock,
            price: newItem.price || item.price,
          }
        : item
    );
    
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    setEditingItem(null);
    
    // Reset form
    setNewItem({
      name: '',
      category: 'carnes',
      stock: 0,
      unit: 'kg',
      minStock: 0,
      price: '0,00 €',
    });
    
    toast({
      title: "Producto actualizado",
      description: `${newItem.name} ha sido actualizado`
    });
  };
  
  // Handle deleting an inventory item
  const handleDeleteItem = (id: number) => {
    const itemToDelete = inventoryItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const updatedItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    toast({
      title: "Producto eliminado",
      description: `${itemToDelete.name} ha sido eliminado del inventario`
    });
  };
  
  // Handle updating stock quantity
  const handleUpdateStock = (id: number, newStock: number) => {
    if (newStock < 0) return;
    
    const updatedItems = inventoryItems.map(item => 
      item.id === id
        ? { ...item, stock: newStock }
        : item
    );
    
    setInventoryItems(updatedItems);
    saveInventoryItems(updatedItems);
    
    const updatedItem = updatedItems.find(item => item.id === id);
    if (updatedItem) {
      toast({
        title: "Stock actualizado",
        description: `${updatedItem.name}: ${newStock} ${updatedItem.unit}`
      });
    }
  };
  
  // Get inventory stats
  const stats = getInventoryStats();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Producto
            </Button>
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
                    value={newItem.category || 'carnes'}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio por unidad</Label>
                  <Input
                    id="price"
                    value={newItem.price || '0,00 €'}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0,00 €"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock actual</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock || 0}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) })}
                    placeholder="0"
                  />
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
              
              <div className="grid gap-2">
                <Label htmlFor="minStock">Stock mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={newItem.minStock || 0}
                  onChange={(e) => setNewItem({ ...newItem, minStock: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={editingItem ? handleSaveEdit : handleAddItem}>
                {editingItem ? 'Guardar Cambios' : 'Añadir Producto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">Valor del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalValue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">Productos Agotados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{stats.outOfStockItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <p className="text-2xl font-bold text-amber-500">{stats.lowStockItems}</p>
            {stats.lowStockItems > 0 && (
              <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Productos en Inventario</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-8 w-[250px]"
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
                  {inventoryCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                  <TableHead>Unidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateStock(item.id, item.stock - 1)}
                          disabled={item.stock <= 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.stock}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleUpdateStock(item.id, item.stock + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      {item.stock <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Agotado
                        </span>
                      ) : item.stock < item.minStock ? (
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No se encontraron productos</p>
              <p className="text-sm mt-1">Intenta con otra búsqueda o añade nuevos productos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManager;
