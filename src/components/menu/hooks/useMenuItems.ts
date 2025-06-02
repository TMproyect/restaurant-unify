
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MenuItem, fetchMenuItems } from '@/services/menu/menuItemService';

interface UseMenuItemsProps {
  initialPage?: number;
  initialPageSize?: number;
  initialSearchTerm?: string;
  initialCategoryFilter?: string;
}

export function useMenuItems({
  initialPage = 1,
  initialPageSize = 12,
  initialSearchTerm = '',
  initialCategoryFilter = ''
}: UseMenuItemsProps = {}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filterCategory, setFilterCategory] = useState(initialCategoryFilter);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(initialPageSize);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar elementos del menú
  const loadMenuItems = useCallback(async (resetPage = false) => {
    try {
      console.log('🔄 useMenuItems: Loading menu items...');
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
        console.log('✅ useMenuItems: Loaded', result.items.length, 'items');
        setItems(result.items);
        setTotalItems(result.total);
        setHasMore(result.hasMore);
      } else {
        console.log('⚠️ useMenuItems: No items returned');
        setItems([]);
        setTotalItems(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ useMenuItems: Error loading items:', error);
      toast.error('No se pudieron cargar los elementos del menú');
      setItems([]);
      setTotalItems(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCategory, searchTerm]);

  // Cargar elementos cuando cambien los filtros o la página
  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems, page, refreshKey]);

  // Escuchar eventos de actualización con logging mejorado
  useEffect(() => {
    const handleMenuUpdate = () => {
      console.log('🔄 useMenuItems: Menu update event received, triggering refresh');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('menuItemsUpdated', handleMenuUpdate);
    
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdate);
    };
  }, []);

  // Handlers para interacción
  const handleSearch = useCallback(() => {
    console.log('🔄 useMenuItems: Search triggered');
    loadMenuItems(true);
  }, [loadMenuItems]);

  const handleCategoryChange = (value: string) => {
    console.log('🔄 useMenuItems: Category changed to:', value);
    setFilterCategory(value);
    setPage(1);
    setTimeout(() => loadMenuItems(true), 0);
  };

  const handleNextPage = useCallback(() => {
    if (hasMore) {
      console.log('🔄 useMenuItems: Moving to next page');
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      console.log('🔄 useMenuItems: Moving to previous page');
      setPage(prev => prev - 1);
    }
  }, [page]);

  const refreshItems = useCallback(() => {
    console.log('🔄 useMenuItems: Manual refresh triggered');
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
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
  };
}
