
import { toast } from 'sonner';
import { initializeStorage, uploadMenuItemImage } from '@/services/storage/index';
import { generateUUID } from '../utils/formUtils';
import { UrlVerificationService } from './urlVerificationService';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Service for handling image uploads with verification
 */
export class ImageUploadService {
  /**
   * Uploads an image file and returns the verified URL
   */
  static async uploadImage(imageFile: File): Promise<UploadResult> {
    console.log('📤 ImageUpload - ⭐ Starting upload process');
    console.log('📤 ImageUpload - File details:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });

    try {
      // Ensure storage is initialized
      console.log('📤 ImageUpload - Ensuring storage initialization...');
      await initializeStorage();

      // Generate unique filename
      const fileExtension = imageFile.name.split('.').pop() || 'jpg';
      const uniqueFileName = `${generateUUID()}.${fileExtension}`;

      console.log('📤 ImageUpload - Generated filename:', uniqueFileName);

      // Upload to Supabase Storage
      console.log('📤 ImageUpload - 🚀 Starting upload to Supabase...');
      const uploadResult = await uploadMenuItemImage(imageFile, uniqueFileName);

      if (!uploadResult.success || !uploadResult.imageUrl) {
        const errorMsg = uploadResult.error || 'Error desconocido en upload';
        console.error('📤 ImageUpload - ❌ Upload failed:', errorMsg);
        toast.error(`Error al subir imagen: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      console.log('📤 ImageUpload - ✅ Upload successful, URL:', uploadResult.imageUrl);

      // Verify URL accessibility (non-blocking)
      console.log('📤 ImageUpload - 🔍 Verifying URL accessibility...');
      const isAccessible = await UrlVerificationService.verifyUrlWithRetry(uploadResult.imageUrl);

      if (!isAccessible) {
        console.warn('📤 ImageUpload - ⚠️ URL verification failed, but continuing');
        toast.warning('Imagen subida exitosamente. Puede tardar unos momentos en aparecer.');
      } else {
        console.log('📤 ImageUpload - ✅ URL verification passed');
      }

      return {
        success: true,
        imageUrl: uploadResult.imageUrl
      };

    } catch (error) {
      console.error('📤 ImageUpload - ❌ Exception during upload:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al procesar imagen: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Handles the complete upload process for menu items
   */
  static async handleMenuItemImageUpload(
    imageFile: File | null,
    currentImageUrl?: string
  ): Promise<string | undefined> {
    // If no new image, return current URL
    if (!imageFile) {
      console.log('📤 ImageUpload - No new image, returning current URL');
      return currentImageUrl;
    }

    console.log('📤 ImageUpload - Processing new image upload...');
    const result = await this.uploadImage(imageFile);

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload image');
    }

    return result.imageUrl;
  }
}
