
import React from 'react';
import { MenuItem } from '@/services/menu/menuItemService';
import { MenuCategory } from '@/services/menu/categoryService';
import MenuContentContainer from './content/MenuContentContainer';

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

/**
 * MenuContent component responsible for rendering the appropriate UI based on state
 */
const MenuContent: React.FC<MenuContentProps> = (props) => {
  return <MenuContentContainer {...props} />;
};

export default MenuContent;
