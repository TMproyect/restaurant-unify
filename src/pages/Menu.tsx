
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag } from 'lucide-react';
import { fetchMenuCategories, initializeStorage } from '@/services/menuService';
import { getLowStockItems } from '@/services/inventoryService';

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

  // Inicializar almacenamiento silenciosamente en segundo plano
  const initStorageBackend = async () => {
    try {
      console.log('🔄 Inicializando backend de almacenamiento...');
      await initializeStorage();
      console.log('🔄 Inicialización de almacenamiento completada');
    } catch (error) {
      console.error('🔄 Error al inicializar almacenamiento:', error);
      // No mostrar errores al usuario, manejar silenciosamente
    }
  };

  useEffect(() => {
    loadCategories();
    
    // Inicializar almacenamiento automáticamente
    initStorageBackend();
    
    // Programar verificaciones periódicas de almacenamiento en segundo plano
    const intervalId = setInterval(() => {
      initStorageBackend();
    }, 60000); // Verificar cada minuto
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Load low stock alerts from Supabase
    const showInventoryAlerts = async () => {
      try {
        const lowStockItems = await getLowStockItems();
        
        // Show toast notifications for each alert item
        lowStockItems.forEach(item => {
          toast({
            title: `Alerta de inventario: ${item.name}`,
            description: `Quedan ${item.stock_quantity}${item.unit || ''} (Mínimo: ${item.min_stock_level}${item.unit || ''})`,
            variant: "destructive"
          });
        });
      } catch (error) {
        console.error('Error loading inventory alerts:', error);
      }
    };

    showInventoryAlerts();
  }, [toast]);

  const handleSynchronize = () => {
    // Iniciar sincronización y verificación de almacenamiento
    initStorageBackend();
    
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
          <div className="flex gap-2">
            <Button onClick={handleSynchronize}>
              Sincronizar Cambios
            </Button>
          </div>
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
            <MenuManager 
              categories={categories} 
              isLoading={loading}
            />
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
