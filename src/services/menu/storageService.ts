
// Este archivo re-exporta las funciones de imageStorage para mantener compatibilidad
// Toda la funcionalidad se ha movido a src/services/storage/imageStorage.ts

import { 
  uploadMenuItemImage, 
  deleteMenuItemImage, 
  initializeStorage,
  getImageUrlWithCacheBusting
} from '../storage/imageStorage';

// Re-exportar para compatibilidad con código existente
export { 
  uploadMenuItemImage, 
  deleteMenuItemImage, 
  initializeStorage,
  getImageUrlWithCacheBusting
};
