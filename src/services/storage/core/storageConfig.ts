
import { supabase } from '@/integrations/supabase/client';

// Configuration constants for storage
export const STORAGE_BUCKET = 'menu_images';

// Variable for avoiding multiple initializations
export let isInitializing = false;
export let initializationPromise: Promise<boolean> | null = null;
export let lastInitAttempt = 0;
export const MIN_RETRY_INTERVAL = 3000; // Minimum 3 seconds between initialization attempts

// Helper function to get public URL for a file in storage
export const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Agrega parámetros de cache busting a la URL
 */
export const getImageUrlWithCacheBusting = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Si es Base64, retornar sin modificación
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // Agregar timestamp para cache busting
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}t=${Date.now()}`;
};
