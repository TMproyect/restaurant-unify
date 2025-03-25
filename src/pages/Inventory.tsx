
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Filter, AlertTriangle } from 'lucide-react';

// Datos de ejemplo para inventario
const inventoryItems = [
  { id: 1, name: 'Pollo', category: 'Carnes', stock: 30, unit: 'kg', minStock: 10, price: '$5.50' },
  { id: 2, name: 'Tomates', category: 'Vegetales', stock: 15, unit: 'kg', minStock: 20, price: '$2.20' },
  { id: 3, name: 'Aceite de oliva', category: 'Aceites', stock: 45, unit: 'l', minStock: 10, price: '$7.80' },
  { id: 4, name: 'Harina', category: 'Panadería', stock: 100, unit: 'kg', minStock: 30, price: '$1.50' },
  { id: 5, name: 'Huevos', category: 'Lácteos', stock: 200, unit: 'unidad', minStock: 50, price: '$0.25' },
  { id: 6, name: 'Queso mozzarella', category: 'Lácteos', stock: 8, unit: 'kg', minStock: 10, price: '$10.30' },
  { id: 7, name: 'Ajo', category: 'Condimentos', stock: 5, unit: 'kg', minStock: 2, price: '$4.25' },
  { id: 8, name: 'Sal', category: 'Condimentos', stock: 20, unit: 'kg', minStock: 5, price: '$0.80' },
];

const Inventory = () => {
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
              <p className="text-2xl font-bold">{inventoryItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Valor del Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$3,548.20</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Productos Agotados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <p className="text-2xl font-bold text-amber-500">2</p>
              <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
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
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      {item.stock < item.minStock ? (
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Inventory;
