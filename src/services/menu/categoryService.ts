
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}

export const fetchMenuCategories = async (): Promise<MenuCategory[]> => {
  try {
    console.log('Fetching menu categories...');
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching menu categories:', error);
      throw error;
    }

    console.log('Menu categories fetched:', data);
    return mapArrayResponse<MenuCategory>(data, 'Failed to map menu categories');
  } catch (error) {
    console.error('Error in fetchMenuCategories:', error);
    toast.error('Error al cargar las categorías del menú');
    return [];
  }
};

export const createMenuCategory = async (category: { name: string, icon?: string }): Promise<MenuCategory | null> => {
  try {
    console.log('Creating menu category:', category);
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating menu category:', error);
      throw error;
    }

    console.log('Menu category created:', data);
    return mapSingleResponse<MenuCategory>(data, 'Failed to map created category');
  } catch (error) {
    console.error('Error in createMenuCategory:', error);
    toast.error('Error al crear la categoría');
    return null;
  }
};

export const updateMenuCategory = async (id: string, updates: Partial<MenuCategory>): Promise<MenuCategory | null> => {
  try {
    console.log('Updating menu category:', id, updates);
    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', filterValue(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating menu category:', error);
      throw error;
    }

    console.log('Menu category updated:', data);
    return mapSingleResponse<MenuCategory>(data, 'Failed to map updated category');
  } catch (error) {
    console.error('Error in updateMenuCategory:', error);
    toast.error('Error al actualizar la categoría');
    return null;
  }
};

export const deleteMenuCategory = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting menu category:', id);
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', filterValue(id));

    if (error) {
      console.error('Error deleting menu category:', error);
      throw error;
    }

    console.log('Menu category deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteMenuCategory:', error);
    toast.error('Error al eliminar la categoría');
    return false;
  }
};
