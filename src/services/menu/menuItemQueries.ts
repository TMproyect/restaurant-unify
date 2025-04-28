
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';
import { MenuItem, MenuItemQueryOptions } from './menuItemTypes';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Obtiene elementos del menú con opciones de paginación y filtrado
 */
export const fetchMenuItems = async (options: MenuItemQueryOptions = {}): Promise<{
  items: MenuItem[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      categoryId,
      searchTerm,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;
    
    // Calcular índices para paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Construir la consulta base
    let query = supabase
      .from('menu_items')
      .select('*', { count: 'exact' });
    
    // Agregar filtros si se proporcionan
    if (categoryId) {
      query = query.eq('category_id', filterValue(categoryId));
    }
    
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    // Obtener count antes de aplicar paginación
    const { count, error: countError } = await query;
    
    if (countError) {
      console.error('Error obteniendo conteo de elementos:', countError);
      throw countError;
    }
    
    // Aplicar ordenación y paginación
    const { data, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) {
      console.error('Error obteniendo elementos del menú:', error);
      throw error;
    }
    
    const total = count || 0;
    const items = mapArrayResponse<MenuItem>(data, 'Error mapeando elementos del menú');
    
    return {
      items,
      total,
      hasMore: from + items.length < total
    };
  } catch (error) {
    console.error('Error en fetchMenuItems:', error);
    toast.error('Error al cargar los elementos del menú');
    return { items: [], total: 0, hasMore: false };
  }
};

/**
 * Función para obtener un solo ítem del menú por ID
 */
export const getMenuItemById = async (id: string): Promise<MenuItem | null> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', filterValue(id))
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
    
    return mapSingleResponse<MenuItem>(data, 'Failed to map menu item');
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    return null;
  }
};
