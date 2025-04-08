
// This file is now just a re-export for backward compatibility
// All functionality has been moved to separate modules

import { 
  MenuCategory, 
  MenuItem,
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from './menu/index';

import {
  uploadMenuItemImage,
  deleteMenuItemImage,
  initializeStorage
} from './storage/imageStorage';

// Re-export all the interfaces and functions for backward compatibility
export {
  // Interfaces
  MenuCategory,
  MenuItem,
  
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
