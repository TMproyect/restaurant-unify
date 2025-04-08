
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Simplified storage service that focuses on reliable image uploads
 * with minimal initialization overhead
 */

// Check if bucket exists without trying to create it repeatedly
const verifyBucketAccess = async (): Promise<boolean> => {
  try {
    console.log('📦 Verifying bucket access...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('📦 Error listing buckets:', error);
      return false;
    }
    
    const bucketExists = data.some(bucket => bucket.name === 'menu_images');
    console.log(`📦 Bucket exists: ${bucketExists}`);
    
    if (bucketExists) {
      // Test read access by listing files
      const { error: listError } = await supabase.storage
        .from('menu_images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('📦 Error listing files:', listError);
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('📦 Error verifying bucket access:', error);
    return false;
  }
};

// Upload an image, with improved error handling and retries
export const uploadMenuItemImage = async (file: File, fileName?: string): Promise<string | null> => {
  try {
    const uniqueFileName = fileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    console.log(`📦 Uploading image: ${uniqueFileName}, size: ${file.size} bytes`);
    
    // Verify access before upload
    const hasAccess = await verifyBucketAccess();
    if (!hasAccess) {
      console.error('📦 No access to menu_images bucket');
      toast.error("Error de almacenamiento. Contacte al administrador.");
      return null;
    }
    
    // Upload with retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📦 Upload attempt ${attempt}/3...`);
        
        const { data, error } = await supabase.storage
          .from('menu_images')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          console.error(`📦 Upload error (attempt ${attempt}/3):`, error);
          
          if (attempt < 3) {
            console.log('📦 Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            throw error;
          }
        }
        
        if (!data || !data.path) {
          console.error('📦 Upload succeeded but no path returned');
          if (attempt < 3) continue;
          throw new Error('No path returned from upload');
        }
        
        // Get public URL with full configuration
        const { data: publicUrlData } = supabase.storage
          .from('menu_images')
          .getPublicUrl(data.path, {
            download: false,
            transform: {
              quality: 80
            }
          });
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
          console.error('📦 Failed to get public URL');
          throw new Error('Failed to get public URL');
        }
        
        const publicUrl = publicUrlData.publicUrl;
        console.log('📦 Successfully uploaded image:', publicUrl);
        
        // Verify URL is accessible
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          console.log(`📦 URL verification response: ${response.status}`);
          
          if (!response.ok) {
            console.warn(`📦 URL may not be publicly accessible (status: ${response.status})`);
          }
        } catch (verifyError) {
          console.warn('📦 Could not verify URL access:', verifyError);
        }
        
        return publicUrl;
      } catch (uploadError) {
        console.error(`📦 Error in upload attempt ${attempt}:`, uploadError);
        if (attempt >= 3) throw uploadError;
      }
    }
    
    return null;
  } catch (error) {
    console.error('📦 Upload failed after all attempts:', error);
    toast.error("No se pudo subir la imagen. Por favor, intente con una imagen más pequeña.");
    return null;
  }
};

// Delete an image
export const deleteMenuItemImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the filename from the URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      console.error('📦 Invalid image URL:', imageUrl);
      return false;
    }
    
    console.log('📦 Deleting image:', fileName);
    
    const { error } = await supabase.storage
      .from('menu_images')
      .remove([fileName]);
    
    if (error) {
      console.error('📦 Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
      return false;
    }
    
    console.log('📦 Image deleted successfully');
    return true;
  } catch (error) {
    console.error('📦 Error in deleteMenuItemImage:', error);
    toast.error('Error al eliminar la imagen');
    return false;
  }
};

// Simple initialization that only tests bucket access
export const initializeStorage = async (): Promise<boolean> => {
  return await verifyBucketAccess();
};
