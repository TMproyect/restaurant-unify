
// This file re-exports all image storage related functionality from the modular files
// for backward compatibility.

import { 
  initializeStorage,
  getImageUrlWithCacheBusting,
  uploadMenuItemImage,
  deleteMenuItemImage,
  migrateBase64ToStorage,
  migrateAllBase64Images,
  fileToBase64,
  base64ToFile,
  STORAGE_BUCKET,
  getPublicUrl
} from './index';

// Re-export everything for backward compatibility
export {
  initializeStorage,
  getImageUrlWithCacheBusting,
  uploadMenuItemImage,
  deleteMenuItemImage,
  migrateBase64ToStorage,
  migrateAllBase64Images,
  fileToBase64,
  base64ToFile,
  STORAGE_BUCKET,
  getPublicUrl
};
