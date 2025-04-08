
// This file now handles image conversion to/from Base64
import { toast } from 'sonner';

/**
 * Converts an image File to a Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }
    
    // Basic validations
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Image should not exceed 5MB"));
      return;
    }

    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      reject(new Error("Invalid image format. Use JPG, PNG, GIF or WebP"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      console.error('Error converting image to Base64:', error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * "Uploads" an image by converting it to Base64
 * Returns the Base64 string directly instead of a URL
 */
export const uploadMenuItemImage = async (file: File): Promise<string | { error?: string; url?: string }> => {
  if (!file) {
    toast.error("No file was selected");
    return { error: "No file was selected" };
  }

  try {
    console.log(`📦 Processing image: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    const base64Data = await fileToBase64(file);
    console.log('📦 Image converted to Base64 successfully');
    
    // Return the Base64 data directly
    return base64Data;
  } catch (error) {
    console.error('📦 Error processing image:', error);
    toast.error(error instanceof Error ? error.message : "Error processing image");
    return { error: error instanceof Error ? error.message : "Error processing image" };
  }
};

/**
 * "Deletes" an image (no-op in Base64 mode)
 */
export const deleteMenuItemImage = async (): Promise<boolean> => {
  // Since we're not storing in Supabase, nothing to delete
  return true;
};

/**
 * No initialization needed for Base64 storage
 */
export const initializeStorage = async (): Promise<boolean> => {
  console.log('📦 Base64 image storage initialized (no external storage required)');
  return true;
};

/**
 * Helper to ensure consistent cache busting for Base64 images
 */
export const getImageUrlWithCacheBusting = (imageData: string | null | undefined): string => {
  if (!imageData) return '';
  return imageData; // Base64 data doesn't need cache busting
};
