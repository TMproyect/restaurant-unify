
import React, { useState, useEffect, useCallback } from 'react';
import { MenuCategory, fetchMenuCategories } from '@/services/menu';

interface MenuDataLoaderProps {
  children: (props: {
    categories: MenuCategory[];
    loading: boolean;
    refreshCategories: () => Promise<void>;
  }) => React.ReactNode;
}

const MenuDataLoader: React.FC<MenuDataLoaderProps> = ({ children }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const categoriesData = await fetchMenuCategories();
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return <>{children({ categories, loading, refreshCategories: loadCategories })}</>;
};

export default MenuDataLoader;
