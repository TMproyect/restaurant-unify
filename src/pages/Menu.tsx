
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Tag, Cloud, RefreshCw } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
import { Button } from '@/components/ui/button';
import { initializeStorage } from '@/services/storage/imageStorage';
import { migrateAllBase64Images } from '@/services/menu/menuItemService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migratingImages, setMigratingImages] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  
  // Función para inicializar el almacenamiento
  const initStorage = useCallback(async () => {
    const success = await initializeStorage();
    setStorageInitialized(success);
    if (!success) {
      toast.error("No se pudo inicializar el almacenamiento de imágenes");
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
    // Inicializar almacenamiento y cargar categorías
    const initialize = async () => {
      await initStorage();
      await loadCategories();
    };
    
    initialize();
    console.log('🔄 Menu cargado correctamente');
  }, [initStorage, loadCategories]);

  const handleCategoriesUpdated = useCallback(() => {
    loadCategories();
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  }, [loadCategories]);
  
  // Migrar imágenes Base64 a Storage
  const handleMigrateImages = useCallback(async () => {
    try {
      setMigratingImages(true);
      toast.info("Iniciando migración de imágenes");
      
      const result = await migrateAllBase64Images();
      
      if (result) {
        toast.success("Migración de imágenes completada correctamente");
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      } else {
        toast.info("No se encontraron imágenes para migrar");
      }
    } catch (error) {
      console.error('Error al migrar imágenes:', error);
      toast.error("Error al migrar imágenes");
    } finally {
      setMigratingImages(false);
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Menú</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initStorage}
              disabled={migratingImages}
              className="gap-2"
            >
              <Cloud className="h-4 w-4" />
              Verificar almacenamiento
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleMigrateImages}
              disabled={migratingImages || !storageInitialized}
              className="gap-2"
            >
              {migratingImages ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {migratingImages ? 'Migrando...' : 'Migrar imágenes'}
            </Button>
          </div>
        </div>
        
        {!storageInitialized && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>Almacenamiento no inicializado</AlertTitle>
            <AlertDescription>
              El almacenamiento de imágenes no está configurado correctamente. 
              Haga clic en "Verificar almacenamiento" para resolver el problema.
            </AlertDescription>
          </Alert>
        )}
        
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
              storageInitialized={storageInitialized}
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
