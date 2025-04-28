
import React from 'react';
import { MenuItem } from '@/services/menu/menuItemService';
import MenuItemCard from './MenuItemCard';

interface MenuItemsListProps {
  items: MenuItem[];
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
  getCategoryName: (categoryId: string | undefined) => string;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({
  items,
  onEditItem,
  onDeleteItem,
  getCategoryName,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          categoryName={getCategoryName(item.category_id)}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
};

export default MenuItemsList;
