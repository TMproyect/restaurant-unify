
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuManager from '@/components/menu/MenuManager';
import InventoryManager from '@/components/inventory/InventoryManager';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, Utensils } from 'lucide-react';

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const { toast } = useToast();
  
  const handleSynchronize = () => {
    toast({
      title: "Sincronización completada",
      description: "Los cambios han sido sincronizados con todos los dispositivos"
    });
    
    // Dispatch events to update other components
    window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
    window.dispatchEvent(new CustomEvent('inventoryItemsUpdated'));
  };
  
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Menú e Inventario</h1>
          <Button onClick={handleSynchronize}>
            Sincronizar Cambios
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span>Menú</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Inventario</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu" className="mt-4">
            <MenuManager />
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-4">
            <InventoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Menu;
