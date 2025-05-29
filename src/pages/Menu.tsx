
import React from 'react';
import Layout from '@/components/layout/Layout';
import MenuDataLoader from '@/components/menu/MenuDataLoader';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuTabs from '@/components/menu/MenuTabs';
import SilentStorageInitializer from '@/components/menu/SilentStorageInitializer';

const Menu: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <SilentStorageInitializer />
        <MenuHeader />
        
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
