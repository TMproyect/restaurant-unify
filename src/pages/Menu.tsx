
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { fetchMenuCategories, verifyStorageConnection } from '@/services/menuService';
import { getLowStockItems } from '@/services/inventoryService';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageConnected, setStorageConnected] = useState(true);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(false);
  const [storageCheckComplete, setStorageCheckComplete] = useState(false);
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

  // Verificar la conexión al almacenamiento
  const checkStorageConnection = async () => {
    try {
      setCheckingStorage(true);
      setStorageCheckComplete(false);
      console.log('Verificando conexión al almacenamiento...');
      
      const connectionResult = await verifyStorageConnection();
      
      if (typeof connectionResult === 'object') {
        setStorageConnected(connectionResult.connected);
        setStorageMessage(connectionResult.message);
        
        if (!connectionResult.connected) {
          toast({
            title: "Advertencia de almacenamiento",
            description: connectionResult.message || "No se pudo verificar la conexión al almacenamiento",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Conexión al almacenamiento",
            description: connectionResult.message || "Conexión al almacenamiento verificada correctamente"
          });
        }
      } else {
        setStorageConnected(connectionResult);
        if (!connectionResult) {
          setStorageMessage("No se pudo verificar la conexión al almacenamiento");
          toast({
            title: "Advertencia",
            description: "No se pudo verificar la conexión al almacenamiento. Las imágenes pueden no funcionar correctamente.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Conexión verificada",
            description: "Conexión al almacenamiento verificada correctamente"
          });
        }
      }
      
      // Cuando se completa la verificación
      setStorageCheckComplete(true);
      
      // Recargar automáticamente la página si la conexión se establece correctamente
      if (
        (typeof connectionResult === 'object' && connectionResult.connected) ||
        (typeof connectionResult === 'boolean' && connectionResult)
      ) {
        toast({
          title: "Recargando página",
          description: "La conexión se ha establecido correctamente. Recargando para aplicar cambios..."
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error al verificar conexión de almacenamiento:', error);
      setStorageConnected(false);
      setStorageMessage("Error al verificar la conexión al almacenamiento: " + (error.message || error));
      setStorageCheckComplete(true);
    } finally {
      setTimeout(() => {
        setCheckingStorage(false);
      }, 1500);
    }
  };

  useEffect(() => {
    loadCategories();
    checkStorageConnection();
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
          <Button onClick={handleSynchronize}>
            Sincronizar Cambios
          </Button>
        </div>
        
        {!storageConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Problemas con el almacenamiento</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {storageMessage || "No se pudo conectar con el servicio de almacenamiento. La subida y visualización de imágenes puede no funcionar correctamente."}
                </p>
                <div className="mt-2 flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white mr-2" 
                    onClick={checkStorageConnection}
                    disabled={checkingStorage}
                  >
                    {checkingStorage ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Verificar conexión
                      </>
                    )}
                  </Button>
                  
                  {storageCheckComplete && (
                    <span className="text-xs text-amber-700">
                      Verificación completada. Intente recargar la página o contacte al administrador.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {storageConnected && storageCheckComplete && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-green-800">Almacenamiento conectado</h3>
                <p className="text-sm text-green-700 mt-1">
                  La conexión al almacenamiento está funcionando correctamente. Puede subir imágenes sin problemas.
                </p>
              </div>
            </div>
          </div>
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
            <MenuManager categories={categories} isLoading={loading} />
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
