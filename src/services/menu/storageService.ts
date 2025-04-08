
// This file re-exports the imageStorage functions for backwards compatibility
// All functionality has been moved to src/services/storage/imageStorage.ts

import { 
  uploadMenuItemImage, 
  deleteMenuItemImage, 
  initializeStorage 
} from '../storage/imageStorage';

// Re-export for backward compatibility
export { 
  uploadMenuItemImage, 
  deleteMenuItemImage, 
  initializeStorage 
};
