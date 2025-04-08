
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Tag, AlertTriangle } from 'lucide-react';
import { fetchMenuCategories, verifyStorageConnection } from '@/services/menuService';
import { getLowStockItems } from '@/services/inventoryService';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageConnected, setStorageConnected] = useState(true);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
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

  useEffect(() => {
    loadCategories();
    
    // Verificar la conexión al almacenamiento
    const checkStorageConnection = async () => {
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
        }
      }
    };
    
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
              <div>
                <h3 className="font-medium text-amber-800">Problemas con el almacenamiento</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {storageMessage || "No se pudo conectar con el servicio de almacenamiento. La subida y visualización de imágenes puede no funcionar correctamente."}
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
