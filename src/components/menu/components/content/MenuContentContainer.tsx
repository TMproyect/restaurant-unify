
import React from 'react';
import { MenuItem } from '@/services/menu/menuItemService';
import { MenuCategory } from '@/services/menu/categoryService';
import MenuItemsList from '../MenuItemsList';
import MenuLoadingSkeleton from '../MenuLoadingSkeleton';
import MenuEmptyState from '../MenuEmptyState';
import { getCategoryName } from '../../utils/categoryUtils';

interface MenuContentContainerProps {
  items: MenuItem[];
  loading: boolean;
  searchTerm: string;
  filterCategory: string;
  categories: MenuCategory[];
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
  onAddItem: () => void;
}

/**
 * Container component that determines which content to display based on loading state and data availability
 */
const MenuContentContainer: React.FC<MenuContentContainerProps> = ({
  items,
  loading,
  searchTerm,
  filterCategory,
  categories,
  onEditItem,
  onDeleteItem,
  onAddItem
}) => {
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
      getCategoryName={(categoryId) => getCategoryName(categoryId, categories)}
    />
  );
};

export default MenuContentContainer;
