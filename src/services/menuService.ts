
// This file is now just a re-export for backward compatibility
// All functionality has been moved to separate modules

import { 
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from './menu/categoryService';

import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from './menu/menuItemService';

import {
  uploadMenuItemImage,
  deleteMenuItemImage,
  initializeStorage
} from './menu/storageService';

// Re-export all the interfaces and functions for backward compatibility
// Use 'export type' for TypeScript interfaces to fix the isolatedModules error
export type { MenuCategory } from './menu/categoryService';
export type { MenuItem } from './menu/menuItemService';

// Re-export all functions
export {
  // Category functions
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  
  // Menu item functions
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  
  // Storage functions
  uploadMenuItemImage,
  deleteMenuItemImage,
  initializeStorage
};
