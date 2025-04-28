import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Search, AlertCircle, Info } from 'lucide-react';
import { MenuCategory } from '@/services/menu/categoryService';
import { MenuItem, fetchMenuItems } from '@/services/menu/menuItemService';
import MenuFilters from './components/MenuFilters';
import MenuItemsList from './components/MenuItemsList';
import MenuItemForm from './MenuItemForm';
import MenuItemDeleteDialog from './components/MenuItemDeleteDialog';
import MenuLoadingSkeleton from './components/MenuLoadingSkeleton';
import MenuEmptyState from './components/MenuEmptyState';
import MenuPagination from './components/MenuPagination';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface MenuManagerProps {
  categories: MenuCategory[];
  isLoading: boolean;
  storageInitialized?: boolean;
}

const MenuManager: React.FC<MenuManagerProps> = ({ 
  categories, 
  isLoading,
  storageInitialized = true
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(12);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const loadMenuItems = useCallback(async (resetPage = false) => {
    try {
      console.log('📦 Cargando elementos del menú...');
      setLoading(true);
      
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }
      
      const result = await fetchMenuItems({
        page: currentPage,
        pageSize,
        categoryId: filterCategory === "all" ? undefined : filterCategory || undefined,
        searchTerm: searchTerm || undefined
      });
      
      if (result && result.items) {
        console.log(`📦 Cargados ${result.items.length} elementos del menú (total: ${result.total})`);
        setItems(result.items);
        setTotalItems(result.total);
        setHasMore(result.hasMore);
      } else {
        console.warn('📦 Respuesta vacía al cargar elementos del menú');
        setItems([]);
        setTotalItems(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error al cargar elementos del menú:', error);
      toast.error('No se pudieron cargar los elementos del menú');
      setItems([]);
      setTotalItems(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCategory, searchTerm]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems, page, refreshKey]);

  useEffect(() => {
    const handleMenuUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('menuItemsUpdated', handleMenuUpdate);
    
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdate);
    };
  }, []);

  const handleSearch = useCallback(() => {
    loadMenuItems(true);
  }, [loadMenuItems]);

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
    setPage(1);
    setTimeout(() => loadMenuItems(true), 0);
  };

  const handleNextPage = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleItemFormClose = (saved: boolean) => {
    setShowItemForm(false);
    if (saved) {
      loadMenuItems();
    }
  };

  const confirmDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const handleDeleteCancel = () => {
    setItemToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex gap-2 w-full lg:w-auto">
          <Button 
            onClick={handleAddItem} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Añadir plato
          </Button>
        </div>
        
        <MenuFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          onCategoryChange={handleCategoryChange}
          handleSearch={handleSearch}
          handleSearchKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          categories={categories}
        />
      </div>
      
      {!storageInitialized && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Problemas con las imágenes</AlertTitle>
          <AlertDescription>
            El sistema de almacenamiento no se inicializó correctamente. Las imágenes podrían no mostrarse o visualizarse incorrectamente.
          </AlertDescription>
        </Alert>
      )}
      
      {loading || isLoading ? (
        <MenuLoadingSkeleton />
      ) : items.length === 0 ? (
        <MenuEmptyState
          searchTerm={searchTerm}
          filterCategory={filterCategory}
          onAddItem={handleAddItem}
        />
      ) : (
        <>
          <MenuItemsList
            items={items}
            onEditItem={handleEditItem}
            onDeleteItem={confirmDelete}
            getCategoryName={(categoryId) => {
              if (!categoryId) return 'Sin categoría';
              const category = categories.find(cat => cat.id === categoryId);
              return category ? category.name : 'Categoría desconocida';
            }}
          />
          
          <MenuPagination
            page={page}
            hasMore={hasMore}
            totalItems={totalItems}
            itemsPerPage={items.length}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        </>
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
        onDeleted={() => {
          loadMenuItems();
        }}
      />
    </div>
  );
};

export default MenuManager;
