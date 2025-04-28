
/**
 * This file re-exports all menu item related functionality from the modular files
 * for backward compatibility.
 */
import { MenuItem, MenuItemQueryOptions } from './menuItemTypes';
import { fetchMenuItems, getMenuItemById } from './menuItemQueries';
import { createMenuItem, updateMenuItem, deleteMenuItem } from './menuItemMutations';
import { migrateBase64ToStorage, migrateAllBase64Images } from './menuItemMigration';

// Re-export all types and functions for backward compatibility
export type { MenuItem, MenuItemQueryOptions };
export {
  fetchMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  migrateBase64ToStorage,
  migrateAllBase64Images
};
