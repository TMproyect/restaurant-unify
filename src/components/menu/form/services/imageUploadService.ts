
import { toast } from 'sonner';
import { generateUUID } from '../utils/formUtils';
import { EnhancedImageUploadService } from '@/services/storage/operations/enhancedImageUpload';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Service for handling image uploads with enhanced validation and error handling
 */
export class ImageUploadService {
  /**
   * Uploads an image file and returns the verified URL
   */
  static async uploadImage(imageFile: File): Promise<UploadResult> {
    console.log('📤 ImageUpload - ⭐ Starting enhanced upload process');
    console.log('📤 ImageUpload - File details:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });

    try {
      // Generate unique filename
      const fileExtension = imageFile.name.split('.').pop() || 'jpg';
      const uniqueFileName = `${generateUUID()}.${fileExtension}`;

      console.log('📤 ImageUpload - Generated filename:', uniqueFileName);

      // Use enhanced upload service
      const result = await EnhancedImageUploadService.uploadImage(imageFile, uniqueFileName);

      if (!result.success) {
        const errorMsg = result.error || 'Error desconocido en upload';
        console.error('📤 ImageUpload - ❌ Enhanced upload failed:', {
          error: errorMsg,
          debugInfo: result.debugInfo
        });
        
        toast.error(`Error al subir imagen: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      console.log('📤 ImageUpload - ✅ Enhanced upload successful');
      console.log('📤 ImageUpload - Debug info:', result.debugInfo);

      toast.success('Imagen subida exitosamente');

      return {
        success: true,
        imageUrl: result.imageUrl
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
