
/**
 * Types related to menu items
 */
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
  sku?: string;
}

export interface MenuItemQueryOptions {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

