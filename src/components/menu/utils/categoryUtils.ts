
import { MenuCategory } from '@/services/menu/categoryService';

/**
 * Gets the name of a category based on its ID
 * @param categoryId The ID of the category to find
 * @param categories The list of available categories
 * @returns The name of the category or a default string if not found
 */
export const getCategoryName = (
  categoryId: string | undefined, 
  categories: MenuCategory[]
): string => {
  if (!categoryId) return 'Sin categoría';
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Categoría desconocida';
};
