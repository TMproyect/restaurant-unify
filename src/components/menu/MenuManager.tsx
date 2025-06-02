
import React, { useState } from 'react';
import { MenuCategory } from '@/services/menu';
import { MenuItem } from '@/services/menu/menuItemService';
import MenuFilters from './components/MenuFilters';
import MenuPagination from './components/MenuPagination';
import { MenuItemForm } from './form/MenuItemForm';
import MenuItemDeleteDialog from './components/MenuItemDeleteDialog';
import MenuContent from './components/MenuContent';
import MenuActions from './components/MenuActions';
import { useMenuItems } from './hooks/useMenuItems';

interface MenuManagerProps {
  categories: MenuCategory[];
  isLoading: boolean;
}

const MenuManager: React.FC<MenuManagerProps> = ({ 
  categories, 
  isLoading
}) => {
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  
  const {
    items,
    totalItems,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategory,
    page,
    hasMore,
    handleSearch,
    handleCategoryChange,
    handleNextPage,
    handlePrevPage,
    refreshItems
  } = useMenuItems();

  // Handlers para interacción con items
  const handleAddItem = () => {
    setSelectedItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleItemFormClose = (saved: boolean) => {
    console.log('🔄 MenuManager: Form closed with saved:', saved);
    
    // Force form to close immediately
    setShowItemForm(false);
    
    // Force refresh if item was saved
    if (saved) {
      console.log('🔄 MenuManager: Forcing refresh due to saved item');
      setTimeout(() => {
        refreshItems();
      }, 100); // Small delay to ensure DB is updated
    }
  };

  const confirmDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const handleDeleteCancel = () => {
    setItemToDelete(null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Renderizado de la UI
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <MenuActions onAddItem={handleAddItem} />
        
        <MenuFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          onCategoryChange={handleCategoryChange}
          handleSearch={handleSearch}
          handleSearchKeyDown={handleSearchKeyDown}
          categories={categories}
        />
      </div>
      
      <MenuContent
        items={items}
        loading={loading || isLoading}
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        categories={categories}
        onEditItem={handleEditItem}
        onDeleteItem={confirmDelete}
        onAddItem={handleAddItem}
      />

      {items.length > 0 && (
        <MenuPagination
          page={page}
          hasMore={hasMore}
          totalItems={totalItems}
          itemsPerPage={items.length}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      )}

      {showItemForm && (
        <MenuItemForm
          item={selectedItem}
          categories={categories}
          onClose={handleItemFormClose}
        />
      )}

      <MenuItemDeleteDialog
        item={itemToDelete}
        onCancel={handleDeleteCancel}
        onDeleted={refreshItems}
      />
    </div>
  );
};

export default MenuManager;
