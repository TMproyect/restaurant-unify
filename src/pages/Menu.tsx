import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Tag } from 'lucide-react';
import { fetchMenuCategories } from '@/services/menu';
import { initializeStorage } from '@/services/storage/imageStorage';
import { getLowStockItems } from '@/services/inventoryService';
import { deleteMenuItem } from '@/services/menu/menuItemService';

window.deleteMenuItemWithConfirmation = async (id: string) => {
  if (!window.confirm("¿Está seguro de que desea eliminar este elemento?")) {
    return false;
  }
  
  const success = await deleteMenuItem(id, false);
  
  if (!success) {
    if (window.confirm("Este plato está siendo usado en pedidos. ¿Desea eliminarlo de todas formas? Esto eliminará también las referencias en los pedidos.")) {
      const forceSuccess = await deleteMenuItem(id, true);
      if (forceSuccess) {
        toast.success("Elemento eliminado con éxito");
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        return true;
      }
    }
    return false;
  } 
  
  toast.success("Elemento eliminado con éxito");
  window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  return true;
};

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initializeStorage();
      } catch (error) {
        console.error('Error al inicializar almacenamiento:', error);
      }
    };
    
    initStorage();
  }, []);
  
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

  useEffect(() => {
    loadCategories();
    
    const showInventoryAlerts = async () => {
      try {
        const lowStockItems = await getLowStockItems();
        
        if (lowStockItems && lowStockItems.length > 0) {
          lowStockItems.forEach(item => {
            toast.error(`Alerta de inventario: ${item.name} - Quedan ${item.stock_quantity}${item.unit || ''} (Mínimo: ${item.min_stock_level}${item.unit || ''})`);
          });
        }
      } catch (error) {
        console.error('Error loading inventory alerts:', error);
      }
    };

    showInventoryAlerts();
  }, []);

  const handleCategoriesUpdated = () => {
    loadCategories();
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
  };
  
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
