
import React from 'react';
import { MenuItem } from '@/services/menu/menuItemService';
import { MenuCategory } from '@/services/menu/categoryService';
import MenuItemsList from './MenuItemsList';
import MenuLoadingSkeleton from './MenuLoadingSkeleton';
import MenuEmptyState from './MenuEmptyState';

interface MenuContentProps {
  items: MenuItem[];
  loading: boolean;
  searchTerm: string;
  filterCategory: string;
  categories: MenuCategory[];
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
  onAddItem: () => void;
}

const MenuContent: React.FC<MenuContentProps> = ({
  items,
  loading,
  searchTerm,
  filterCategory,
  categories,
  onEditItem,
  onDeleteItem,
  onAddItem
}) => {
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría desconocida';
  };

  if (loading) {
    return <MenuLoadingSkeleton />;
  }

  if (items.length === 0) {
    return (
      <MenuEmptyState
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        onAddItem={onAddItem}
      />
    );
  }

  return (
    <MenuItemsList
      items={items}
      onEditItem={onEditItem}
      onDeleteItem={onDeleteItem}
      getCategoryName={getCategoryName}
    />
  );
};

export default MenuContent;
