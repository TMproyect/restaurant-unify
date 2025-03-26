
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Utensils, Tag } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menuService';

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

  useEffect(() => {
    // Check for inventory alerts on component mount
    const alertItems = [
      {
        name: "Tomates",
        current: 15,
        minimum: 20,
        unit: "kg"
      },
      {
        name: "Queso mozzarella",
        current: 8,
        minimum: 10,
        unit: "kg"
      },
      {
        name: "Aceite de oliva",
        current: 5,
        minimum: 10,
        unit: "l"
      }
    ];

    // Show toast notifications for each alert item
    alertItems.forEach(item => {
      toast({
        title: `Alerta de inventario: ${item.name}`,
        description: `Quedan ${item.current}${item.unit} (Mínimo: ${item.minimum}${item.unit})`,
        variant: "destructive"
      });
    });
  }, [toast]);

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
    </Layout>
  );
};

export default Menu;
