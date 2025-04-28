
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Utensils, Tag } from 'lucide-react';
import { MenuCategory } from '@/services/menu';
import MenuManager from '@/components/menu/MenuManager';
import CategoryManager from '@/components/menu/CategoryManager';

interface MenuTabsProps {
  categories: MenuCategory[];
  loading: boolean;
  onCategoriesUpdated: () => void;
}

const MenuTabs: React.FC<MenuTabsProps> = ({
  categories,
  loading,
  onCategoriesUpdated
}) => {
  return (
    <Tabs defaultValue="menu" className="w-full">
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
        <CategoryManager onCategoriesUpdated={onCategoriesUpdated} />
      </TabsContent>
    </Tabs>
  );
};

export default MenuTabs;
