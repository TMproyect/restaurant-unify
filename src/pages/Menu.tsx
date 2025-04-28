
import React from 'react';
import Layout from '@/components/layout/Layout';
import MenuDataLoader from '@/components/menu/MenuDataLoader';
import MenuStorageInitializer from '@/components/menu/MenuStorageInitializer';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuTabs from '@/components/menu/MenuTabs';

const Menu: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <MenuHeader />
        
        <MenuStorageInitializer />
        
        <MenuDataLoader>
          {({ categories, loading, refreshCategories }) => (
            <MenuTabs
              categories={categories}
              loading={loading}
              onCategoriesUpdated={refreshCategories}
            />
          )}
        </MenuDataLoader>
      </div>
    </Layout>
  );
};

export default Menu;
