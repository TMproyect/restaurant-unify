
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import InventoryManager from '@/components/inventory/InventoryManager';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag, Package } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menuService';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categoriesTab, setCategoriesTab] = useState(false);
  const [inventoryTab, setInventoryTab] = useState(false);
  const [categories, setCategories] = useState([]);
  const { toast } = useToast();
  
  const loadCategories = async () => {
    try {
      const categoriesData = await fetchMenuCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      });
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
    window.dispatchEvent(new CustomEvent('inventoryItemsUpdated'));
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
          <h1 className="text-2xl font-bold">
            {categoriesTab 
              ? "Gestión de Categorías" 
              : inventoryTab 
                ? "Gestión de Inventario" 
                : "Gestión de Menú"}
          </h1>
          <Button onClick={handleSynchronize}>
            Sincronizar Cambios
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span>Menú</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu" className="mt-4">
            {categoriesTab ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setCategoriesTab(false)}
                    className="mb-4"
                  >
                    Volver a Productos
                  </Button>
                </div>
                <CategoryManager onCategoriesUpdated={handleCategoriesUpdated} />
              </div>
            ) : inventoryTab ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setInventoryTab(false)}
                    className="mb-4"
                  >
                    Volver a Productos
                  </Button>
                </div>
                <InventoryManager />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setCategoriesTab(true)}
                    className="mb-4"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Gestionar Categorías
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInventoryTab(true)}
                    className="mb-4"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Gestionar Inventario
                  </Button>
                </div>
                <MenuManager />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Menu;
