
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Tag, ServerCrash, RefreshCw, HardDrive } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
import { initializeStorage } from '@/services/storage';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageInitializing, setStorageInitializing] = useState(true);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Función para inicializar el almacenamiento
  const initializeResources = useCallback(async () => {
    try {
      setStorageInitializing(true);
      setInitError(null);
      console.log('📦 Iniciando inicialización de recursos de almacenamiento...');
      
      // Inicializar almacenamiento
      const initialized = await initializeStorage();
      console.log('📦 Storage initialization result:', initialized);
      setStorageInitialized(initialized);
      
      if (!initialized) {
        console.warn('📦 No se pudo inicializar el almacenamiento correctamente');
        setInitError('No se pudo inicializar el almacenamiento correctamente. Las imágenes podrían no mostrarse.');
        // Seguimos intentando cargar los datos
      }
    } catch (error) {
      console.error('Error crítico al inicializar recursos:', error);
      setInitError('Error al inicializar almacenamiento. Por favor recarga la página.');
    } finally {
      setStorageInitializing(false);
    }
  }, []);
  
  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      console.log('📦 Cargando categorías...');
      setLoading(true);
      const categoriesData = await fetchMenuCategories();
      
      if (!categoriesData || categoriesData.length === 0) {
        console.warn('📦 No se encontraron categorías o respuesta vacía');
        toast.warning("No se encontraron categorías");
      } else {
        setCategories(categoriesData);
        console.log('📦 Categorías cargadas:', categoriesData.length);
      }
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
  }, [initializeResources, loadCategories, retryCount]);

  const handleCategoriesUpdated = useCallback(() => {
    loadCategories();
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  }, [loadCategories]);

  const handleRetry = useCallback(() => {
    setInitError(null);
    setLoading(true);
    setStorageInitializing(true);
    setRetryCount(prev => prev + 1);
    toast.info("Reintentando carga de datos...");
  }, []);

  const renderErrorState = () => (
    <div className="space-y-6">
      <Alert variant="destructive" className="mb-4">
        <ServerCrash className="h-4 w-4 mr-2" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{initError}</p>
          <p className="text-sm">
            Esto puede deberse a problemas con la inicialización de almacenamiento 
            o al cargar las categorías del menú.
          </p>
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col gap-4 items-center">
        <Button 
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
        
        <Alert variant="warning" className="max-w-md">
          <HardDrive className="h-4 w-4 mr-2" />
          <AlertTitle>Información técnica</AlertTitle>
          <AlertDescription className="text-xs">
            <p>El sistema intentó inicializar el almacenamiento de imágenes y cargar las categorías del menú.</p>
            <p className="mt-1">Estado de inicialización: {storageInitialized ? 'Exitoso' : 'Fallido'}</p>
            <p>Categorías cargadas: {categories.length}</p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
  
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <div className="animate-spin">
        <RefreshCw className="h-8 w-8 text-primary" />
      </div>
      <p className="text-lg font-medium">
        {storageInitializing ? 'Inicializando almacenamiento...' : 'Cargando datos del menú...'}
      </p>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Estamos preparando todo para mostrarte el menú.
        {retryCount > 0 && ' Intento ' + (retryCount + 1)}
      </p>
    </div>
  );

  if (loading || storageInitializing) {
    return (
      <Layout>
        {renderLoadingState()}
      </Layout>
    );
  }

  if (initError) {
    return (
      <Layout>
        {renderErrorState()}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Menú</h1>
        </div>
        
        {!storageInitialized && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>Advertencia</AlertTitle>
            <AlertDescription>
              El almacenamiento de imágenes no se inicializó correctamente. Las imágenes podrían no mostrarse.
              <Button variant="outline" size="sm" className="ml-2 mt-2" onClick={handleRetry}>
                <RefreshCw className="h-3 w-3 mr-1" /> Reintentar
              </Button>
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
