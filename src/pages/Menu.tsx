
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Tag, RefreshCw } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
import { getLowStockItems } from '@/services/inventoryService';
import { supabase } from '@/integrations/supabase/client';
import { initializeStorage } from '@/services/storage/imageStorage';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  
  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await fetchMenuCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const initializeBucketAndVerify = async () => {
    try {
      setIsSynchronizing(true);
      console.log('🚀 Iniciando sincronización de almacenamiento...');
      
      // Usar directamente la función de almacenamiento
      const success = await initializeStorage(true);
      
      if (success) {
        console.log('🚀 Almacenamiento inicializado correctamente');
        
        // Verificar acceso al bucket como prueba adicional
        try {
          const { data: files, error: listError } = await supabase.storage
            .from('menu_images')
            .list();
            
          if (listError) {
            console.error('🚀 Error al listar archivos del bucket:', listError);
            throw listError;
          } else {
            console.log('🚀 Lista de archivos obtenida:', files?.length || 0, 'archivos');
            return true;
          }
        } catch (listError) {
          console.error('🚀 Error capturado al listar archivos:', listError);
          throw listError;
        }
      } else {
        console.error('🚀 La inicialización falló');
        
        // Como último recurso, intentar llamar directamente a la Edge Function
        const { data, error } = await supabase.functions.invoke('storage-reinitialize');
        
        if (error) {
          console.error('🚀 Error al invocar función Edge como último recurso:', error);
          throw error;
        }
        
        console.log('🚀 Respuesta de la función Edge (último recurso):', data);
        return data && data.success;
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
        console.log('🔄 Inicializando almacenamiento automáticamente al cargar la página...');
        await initializeBucketAndVerify();
        console.log('🔄 Inicialización automática completada');
      } catch (error) {
        console.error('Error al inicializar bucket:', error);
        toast.error("Error de almacenamiento. Intente presionar el botón 'Sincronizar Imágenes'");
      }
    };
    
    init();
    
    const showInventoryAlerts = async () => {
      try {
        const lowStockItems = await getLowStockItems();
        
        lowStockItems.forEach(item => {
          toast.error(`Alerta de inventario: ${item.name} - Quedan ${item.stock_quantity}${item.unit || ''} (Mínimo: ${item.min_stock_level}${item.unit || ''})`);
        });
      } catch (error) {
        console.error('Error loading inventory alerts:', error);
      }
    };

    showInventoryAlerts();
  }, []);

  const handleSynchronize = async () => {
    setIsSynchronizing(true);
    
    try {
      toast.loading("Sincronizando imágenes. Por favor espere...");
      
      const success = await initializeBucketAndVerify();
      
      toast.dismiss();
      
      if (success) {
        toast.success("Las imágenes han sido sincronizadas correctamente");
      } else {
        toast.error("Se produjo un error durante la sincronización, intente nuevamente");
      }
      
      // Forzar actualización de la UI
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
    } catch (error) {
      console.error('Error en sincronización:', error);
      toast.error("No se pudo completar la sincronización. Intente nuevamente más tarde.");
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
