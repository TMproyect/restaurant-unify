
// Re-export all functionality from subdirectories

// Core functionality
export { 
  getImageUrlWithCacheBusting,
  getPublicUrl,
  STORAGE_BUCKET
} from './core/storageConfig';

export {
  fileToBase64,
  base64ToFile
} from './core/imageConversion';

export {
  initializeStorage
} from './core/storageInitialization';

// Operations
export {
  uploadMenuItemImage
} from './operations/imageUpload';

export {
  deleteMenuItemImage
} from './operations/imageManagement';

// Re-export from menu item migration for backward compatibility
export { 
  migrateBase64ToStorage,
  migrateAllBase64Images 
} from '@/services/menu/menuItemMigration';
