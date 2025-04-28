
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Tag } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
import { initializeStorage } from '@/services/storage';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Función para inicializar el almacenamiento
  const initializeResources = useCallback(async () => {
    try {
      setLoading(true);
      // Inicializar almacenamiento
      const initialized = await initializeStorage();
      console.log('📦 Storage initialization result:', initialized);
      setStorageInitialized(initialized);
      
      if (!initialized) {
        console.warn('📦 No se pudo inicializar el almacenamiento correctamente');
        // No mostrar error al usuario aún, seguimos intentando cargar datos
      }
    } catch (error) {
      console.error('Error al inicializar recursos:', error);
      setInitError('Error al inicializar almacenamiento. Por favor recarga la página.');
    } finally {
      // No terminamos de cargar aquí, esperamos a que se carguen las categorías
    }
  }, []);
  
  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchMenuCategories();
      setCategories(categoriesData);
      console.log('📦 Categorías cargadas:', categoriesData.length);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error("No se pudieron cargar las categorías");
      setInitError('Error al cargar categorías del menú');
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

  if (initError) {
    return (
      <Layout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{initError}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <button 
            onClick={() => {
              setInitError(null);
              setLoading(true);
              initializeResources().then(loadCategories);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

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
