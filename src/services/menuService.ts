
// Este archivo es solo una re-exportación para mantener compatibilidad
// Toda la funcionalidad se ha movido a módulos separados

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
  initializeStorage,
  getImageUrlWithCacheBusting
} from './storage/imageStorage';

// Re-exportar todos los tipos e interfaces para mantener compatibilidad
export type { MenuCategory } from './menu/categoryService';
export type { MenuItem } from './menu/menuItemService';

// Re-exportar todas las funciones
export {
  // Funciones de categoría
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  
  // Funciones de elementos del menú
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  
  // Funciones de almacenamiento
  uploadMenuItemImage,
  deleteMenuItemImage,
  initializeStorage,
  getImageUrlWithCacheBusting
};
