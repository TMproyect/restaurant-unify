
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Store the bucket name in a constant to avoid typos
const BUCKET_NAME = 'menu_images';

// Get Supabase URL and key from the same constants used to initialize the client
const SUPABASE_URL = "https://imcxvnivqrckgjrimzck.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltY3h2bml2cXJja2dqcmltemNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NjM4NjIsImV4cCI6MjA1ODUzOTg2Mn0.BGIWnSFMuz4AR0FuYeH8kRvRwoa72x6JMtdnTbOE6k0";

/**
 * Verifies that the bucket exists without repeatedly trying to create it
 * This verification is only done when absolutely necessary
 */
const verifyBucketExists = async (): Promise<boolean> => {
  try {
    // First try listing files which is a less intrusive operation
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
      
    if (!error) {
      return true; // If we can list, the bucket exists and we have access
    }

    // If there's an error, the bucket might not exist or we don't have permissions
    // Verify if it exists by querying available buckets
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME) || false;
    
    if (bucketExists) {
      // The bucket exists but we can't access it, it's a permissions issue
      console.warn('📦 Bucket exists but cannot be accessed - permissions issue');
      return false;
    }
    
    // The bucket probably doesn't exist or there are permissions issues
    // Use reset_menu_images_permissions to reset permissions/create bucket
    try {
      const { data, error } = await supabase.rpc('reset_menu_images_permissions');
      if (error) throw error;
      console.log('📦 Bucket permissions reset successfully');
      return true;
    } catch (rpcError) {
      console.error('📦 Error trying to reset permissions:', rpcError);
      return false;
    }
  } catch (error) {
    console.error('📦 Error verifying bucket:', error);
    return false;
  }
};

/**
 * Interface for image upload result
 */
export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads an image with improved error handling and correct contentType
 * @param file The file to upload
 * @param fileName Optional file name
 * @returns A URL string or an object with url/error
 */
export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | UploadResult> => {
  if (!file) {
    toast.error("No file was selected");
    return { error: "No file was selected" };
  }

  // Basic validations
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image should not exceed 5MB");
    return { error: "Image should not exceed 5MB" };
  }

  const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validFormats.includes(file.type)) {
    toast.error("Invalid image format. Use JPG, PNG, GIF or WebP");
    return { error: "Invalid image format" };
  }

  try {
    // Verify that the bucket exists, but only once
    await verifyBucketExists();
    
    // Generate a unique name to avoid conflicts
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    console.log(`📦 Uploading image: ${uniqueFileName}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Log the exact content type we're using from the file
    console.log(`📦 File content type detected: ${file.type}`);
    
    // Simplify options - JUST pass contentType and set upsert to false
    // This is the key change to fix the content type issue
    const uploadOptions = {
      contentType: file.type, 
      upsert: false
    };
    
    console.log(`📦 Upload options being used:`, uploadOptions);
    
    // Perform the upload with simplified options
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, file, uploadOptions);
    
    if (error) {
      console.error('📦 Error uploading image:', error);
      toast.error("Error uploading image. Please try again");
      return { error: error.message };
    }
    
    if (!data || !data.path) {
      toast.error("Error processing uploaded image");
      return { error: "Error processing uploaded image" };
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      toast.error("Error generating public URL for image");
      return { error: "Error generating public URL" };
    }
    
    const publicUrl = publicUrlData.publicUrl;
    console.log('📦 Public URL generated:', publicUrl);
    
    // Check that the URL is accessible and the content type is correct
    try {
      const response = await fetch(publicUrl, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      console.log('📦 URL verification:', response.status, response.ok ? 'OK' : 'Error');
      console.log('📦 Returned Content-Type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        console.warn('📦 Public URL is not correctly accessible');
      }
      
      // Verify that content type matches what we expect
      const returnedContentType = response.headers.get('content-type');
      if (returnedContentType && !returnedContentType.startsWith('image/')) {
        console.error(`📦 Content-Type mismatch: expected image/*, got ${returnedContentType}`);
      }
    } catch (e) {
      console.warn('📦 Could not verify URL:', e);
    }
    
    // Return URL as string for compatibility with existing code
    return publicUrl;
  } catch (error) {
    console.error('📦 General error in uploadMenuItemImage:', error);
    toast.error("Unexpected error uploading image");
    return { error: "Unexpected error uploading image" };
  }
};

/**
 * Deletes an image with robust validation
 */
export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    // Extract the file name from the URL
    const urlObj = new URL(imageUrl);
    const pathParts = urlObj.pathname.split('/');
    // The last segment of the path should be the file name
    const fileName = pathParts[pathParts.length - 1];
    
    if (!fileName) {
      console.error('📦 Invalid file name in URL:', imageUrl);
      return false;
    }
    
    console.log('📦 Deleting image:', fileName);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);
    
    if (error) {
      console.error('📦 Error deleting image:', error);
      toast.error('Error deleting image');
      return false;
    }
    
    console.log('📦 Image deleted successfully');
    return true;
  } catch (error) {
    console.error('📦 Error in deleteMenuItemImage:', error);
    toast.error('Error deleting image');
    return false;
  }
};

/**
 * Simplified initialization that verifies the bucket
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    console.log('📦 Verifying access to menu_images bucket...');
    const hasAccess = await verifyBucketExists();
    
    if (!hasAccess) {
      console.warn('📦 Could not verify access to menu_images bucket');
      toast.error("Storage error. This may affect image uploading.");
    } else {
      console.log('📦 Bucket access verified successfully');
    }
    
    return hasAccess;
  } catch (error) {
    console.error('📦 Error in initializeStorage:', error);
    return false;
  }
};

/**
 * Adds a cache busting parameter to the image URL
 * to avoid caching issues with updated images
 */
export const getImageUrlWithCacheBusting = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  try {
    // Add a time parameter to invalidate browser cache
    const url = new URL(imageUrl);
    url.searchParams.set('_cb', Date.now().toString());
    return url.toString();
  } catch (error) {
    // If there's an error processing the URL, return the original
    console.warn('📦 Error processing URL for cache busting:', error);
    return imageUrl;
  }
};
