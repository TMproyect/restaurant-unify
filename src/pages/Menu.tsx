
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag, RefreshCw } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
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
      setIsSynchronizing(true);
      console.log('🚀 Iniciando sincronización de almacenamiento...');
      
      // Usar la función Edge con JWT desactivado
      const { data, error } = await supabase.functions.invoke('storage-reinitialize');
      
      if (error) {
        console.error('🚀 Error al invocar función Edge:', error);
        throw error;
      }
      
      console.log('🚀 Respuesta de la función Edge:', data);
      
      if (data && data.success) {
        console.log('🚀 Almacenamiento inicializado correctamente');
        return true;
      } else {
        console.error('🚀 La función Edge falló:', data?.message || 'Sin mensaje');
        throw new Error(data?.message || 'Error desconocido en la función Edge');
      }
    } catch (error) {
      console.error('🚀 Error general en initializeBucket:', error);
      return false;
    } finally {
      setIsSynchronizing(false);
    }
  };

  useEffect(() => {
    loadCategories();
    
    const init = async () => {
      try {
        // Forzamos la inicialización del bucket al cargar la página
        await initializeBucket();
      } catch (error) {
        console.error('Error al inicializar bucket:', error);
        toast({
          title: "Error",
          description: "No se pudo inicializar el almacenamiento. Intente usando el botón 'Sincronizar Imágenes'",
          variant: "destructive"
        });
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
