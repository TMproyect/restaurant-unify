
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Utensils, Tag } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menuService';
import InventoryAlert from '@/components/dashboard/InventoryAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await fetchMenuCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSynchronize = () => {
    toast({
      title: "Sincronización completada",
      description: "Los cambios han sido sincronizados con todos los dispositivos"
    });
    
    // Dispatch events to update other components
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  };

  const handleCategoriesUpdated = () => {
    // Reload categories
    loadCategories();
    // Force refresh of menu items with new categories
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  };
  
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Menú</h1>
          <Button onClick={handleSynchronize}>
            Sincronizar Cambios
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Tabs defaultValue="menu" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="menu" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span>Platos</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Categorías</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="menu" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Plato
                    </Button>
                  </div>
                  <MenuManager categories={categories} isLoading={loading} />
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="mt-4">
                <CategoryManager onCategoriesUpdated={handleCategoriesUpdated} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas de Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <InventoryAlert />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Menu;
