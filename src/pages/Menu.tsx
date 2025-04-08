
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag, RefreshCw } from 'lucide-react';
import { fetchMenuCategories, initializeStorage } from '@/services/menu';
import { getLowStockItems } from '@/services/inventoryService';
import { supabase } from '@/integrations/supabase/client';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
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

  const initializeBucket = async () => {
    try {
      // Corrigiendo el nombre de la función RPC para que coincida con la definida en supabase/migrations
      await supabase.functions.invoke('storage-reinitialize');
      console.log('🛠️ Bucket reinicializado mediante función Edge');
      return true;
    } catch (error) {
      console.error('🛠️ Error al reinicializar bucket mediante función Edge:', error);
      
      try {
        await initializeStorage();
        return true;
      } catch (storageError) {
        console.error('🛠️ Error en segundo intento de inicialización:', storageError);
        return false;
      }
    }
  };

  useEffect(() => {
    loadCategories();
    
    const init = async () => {
      try {
        await initializeBucket();
      } catch (error) {
        console.error('Error al inicializar bucket:', error);
      }
    };
    
    init();
    
    const showInventoryAlerts = async () => {
      try {
        const lowStockItems = await getLowStockItems();
        
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

  const handleSynchronize = async () => {
    setIsSynchronizing(true);
    
    try {
      const success = await initializeBucket();
      
      if (success) {
        toast({
          title: "Sincronización completada",
          description: "Los permisos de almacenamiento y las imágenes han sido sincronizados"
        });
      } else {
        toast({
          title: "Sincronización parcial",
          description: "Se produjo un error durante la sincronización, intente nuevamente"
        });
      }
      
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
    } catch (error) {
      console.error('Error en sincronización:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la sincronización",
        variant: "destructive"
      });
    } finally {
      setIsSynchronizing(false);
    }
  };

  const handleCategoriesUpdated = () => {
    loadCategories();
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  };
  
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Menú</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleSynchronize} 
              disabled={isSynchronizing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSynchronizing ? 'animate-spin' : ''}`} />
              {isSynchronizing ? 'Sincronizando...' : 'Sincronizar Imágenes'}
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
