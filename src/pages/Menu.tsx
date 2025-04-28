
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Tag } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
import { initializeStorage } from '@/services/storage/imageStorage';
import { migrateAllBase64Images } from '@/services/menu/menuItemService';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Función para inicializar el almacenamiento y migrar imágenes automáticamente
  const initializeResources = useCallback(async () => {
    try {
      // Inicializar almacenamiento
      await initializeStorage();
      
      // Intentar migrar todas las imágenes Base64 a Storage
      await migrateAllBase64Images();
      
      console.log('📦 Recursos inicializados correctamente');
    } catch (error) {
      console.error('Error al inicializar recursos:', error);
      // Intento automático de reinicio después de 3 segundos en caso de error
      setTimeout(() => initializeResources(), 3000);
    }
  }, []);
  
  // Cargar categorías
  const loadCategories = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // Inicializar almacenamiento y cargar categorías automáticamente
    const initialize = async () => {
      await initializeResources();
      await loadCategories();
    };
    
    initialize();
    console.log('🔄 Menu cargado correctamente');
  }, [initializeResources, loadCategories]);

  const handleCategoriesUpdated = useCallback(() => {
    loadCategories();
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  }, [loadCategories]);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Menú</h1>
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
