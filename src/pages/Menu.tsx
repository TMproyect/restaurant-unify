
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag, RefreshCw } from 'lucide-react';
import { fetchMenuCategories, verifyStorageConnection } from '@/services/menuService';
import { getLowStockItems } from '@/services/inventoryService';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageConnected, setStorageConnected] = useState(true);
  const [checkingStorage, setCheckingStorage] = useState(false);
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

  // Verificar la conexión al almacenamiento de manera silenciosa
  const silentStorageCheck = async () => {
    try {
      console.log('📦 Verificando conexión al almacenamiento silenciosamente...');
      const connectionResult = await verifyStorageConnection();
      
      console.log('📦 Resultado de la verificación silenciosa:', connectionResult);
      
      if (typeof connectionResult === 'object') {
        setStorageConnected(connectionResult.connected);
        
        if (connectionResult.connected) {
          console.log('📦 Conexión al almacenamiento verificada correctamente');
        } else {
          console.error('📦 Error de conexión al almacenamiento:', connectionResult.message);
          // Intentamos crear el bucket de forma silenciosa
          await verifyStorageConnection(true);
        }
      }
    } catch (error) {
      console.error('📦 Error en verificación silenciosa de almacenamiento:', error);
      setStorageConnected(false);
    }
  };

  // Verificar la conexión al almacenamiento (botón manual)
  const checkStorageConnection = async () => {
    try {
      setCheckingStorage(true);
      toast({
        title: "Verificando almacenamiento",
        description: "Comprobando conexión al sistema de almacenamiento...",
      });
      
      console.log('📦 Verificando conexión al almacenamiento (manual)...');
      
      const connectionResult = await verifyStorageConnection(true);
      
      console.log('📦 Resultado verificación manual:', connectionResult);
      
      if (typeof connectionResult === 'object') {
        setStorageConnected(connectionResult.connected);
        
        if (connectionResult.connected) {
          toast({
            title: "Conexión establecida",
            description: "Sistema de almacenamiento conectado correctamente"
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast({
            title: "Problema de conexión",
            description: "Intentándolo nuevamente en segundo plano...",
            variant: "destructive"
          });
        }
      } else if (connectionResult === true) {
        setStorageConnected(true);
        toast({
          title: "Conexión establecida",
          description: "Sistema de almacenamiento conectado correctamente"
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Problema de conexión",
          description: "Intentándolo nuevamente en segundo plano...",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('📦 Error al verificar conexión de almacenamiento (manual):', error);
      toast({
        title: "Error de verificación",
        description: "Intentándolo nuevamente en segundo plano...",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setCheckingStorage(false);
      }, 1500);
      
      // Intentar nuevamente en segundo plano después de un error
      setTimeout(() => {
        silentStorageCheck();
      }, 3000);
    }
  };

  useEffect(() => {
    loadCategories();
    silentStorageCheck();
    
    // Programar verificaciones periódicas de almacenamiento en segundo plano
    const intervalId = setInterval(() => {
      silentStorageCheck();
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
            {!storageConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkStorageConnection}
                disabled={checkingStorage}
                className="text-xs"
              >
                {checkingStorage ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Conectar almacenamiento
                  </>
                )}
              </Button>
            )}
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
              storageConnected={storageConnected}
              onRetryStorage={checkStorageConnection}
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
