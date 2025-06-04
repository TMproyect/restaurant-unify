
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
    console.log('🔄 MenuManager: Add item clicked');
    setSelectedItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    console.log('🔄 MenuManager: Edit item clicked:', item.name);
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleItemFormClose = (saved: boolean) => {
    console.log('🔄 MenuManager: Form close callback called with saved:', saved);
    
    // Close form immediately
    setShowItemForm(false);
    setSelectedItem(null);
    
    // Refresh if saved
    if (saved) {
      console.log('🔄 MenuManager: Refreshing items due to save');
      refreshItems();
    }
  };

  const confirmDelete = (item: MenuItem) => {
    console.log('🔄 MenuManager: Delete requested for:', item.name);
    setItemToDelete(item);
  };

  const handleDeleteCancel = () => {
    console.log('🔄 MenuManager: Delete cancelled');
    setItemToDelete(null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  console.log('🔄 MenuManager: Render state:', {
    showItemForm,
    selectedItem: selectedItem?.name || null,
    itemsCount: items.length,
    loading
  });

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
