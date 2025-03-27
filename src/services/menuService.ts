
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { filterValue, mapArrayResponse, mapSingleResponse } from '@/utils/supabaseHelpers';

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  available: boolean;
  popular: boolean;
  allergens?: string[];
  created_at?: string;
  updated_at?: string;
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
      .insert([category as any])
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
      .update(updates as any)
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

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }

    return mapArrayResponse<MenuItem>(data, 'Failed to map menu items');
  } catch (error) {
    console.error('Error in fetchMenuItems:', error);
    toast.error('Error al cargar los elementos del menú');
    return [];
  }
};

export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item as any])
      .select()
      .single();

    if (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }

    return mapSingleResponse<MenuItem>(data, 'Failed to map created menu item');
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    toast.error('Error al crear el elemento del menú');
    return null;
  }
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  try {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('menu_items')
      .update(updatesWithTimestamp as any)
      .eq('id', filterValue(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }

    return mapSingleResponse<MenuItem>(data, 'Failed to map updated menu item');
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    toast.error('Error al actualizar el elemento del menú');
    return null;
  }
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', filterValue(id));

    if (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    toast.error('Error al eliminar el elemento del menú');
    return false;
  }
};

export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  try {
    // Generate a unique file name if not provided
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('menu_images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading menu item image:', error);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('menu_images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadMenuItemImage:', error);
    toast.error('Error al subir la imagen del menú');
    return null;
  }
};
