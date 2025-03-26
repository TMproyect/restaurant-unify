
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchInventoryItems } from '@/services/inventoryService';
import { useQuery } from '@tanstack/react-query';

const Inventory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: inventoryItems = [], isLoading, error } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: fetchInventoryItems
  });
  
  // Filter items based on search term
  const filteredItems = searchTerm 
    ? inventoryItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category_id && item.category_id.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : inventoryItems;
    
  // Calculate stats
  const totalItems = inventoryItems.length;
  const outOfStockItems = inventoryItems.filter(item => item.stock_quantity <= 0).length;
  const lowStockItems = inventoryItems.filter(item => 
    item.stock_quantity > 0 && 
    item.min_stock_level && 
    item.stock_quantity < item.min_stock_level
  ).length;
  
  // Calculate total inventory value - rough estimate
  const totalValue = inventoryItems.reduce((sum, item) => sum + (Number(item.stock_quantity) || 0), 0);

  if (error) {
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
          <Button><Plus size={18} className="mr-2" /> Añadir Producto</Button>
        </div>

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
              <CardTitle className="text-muted-foreground text-sm">Valor del Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Productos Agotados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{outOfStockItems}</p>
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
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
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
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category_id ? item.category_id.name : 'Sin categoría'}</TableCell>
                      <TableCell>{item.stock_quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
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
    </Layout>
  );
};

export default Inventory;
