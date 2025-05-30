
import { toast } from 'sonner';
import { generateUUID } from '../utils/formUtils';
import { EnhancedImageUploadService } from '@/services/storage/operations/enhancedImageUpload';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Simplified image upload service
 */
export class ImageUploadService {
  /**
   * Direct upload without complex validations
   */
  static async uploadImage(imageFile: File): Promise<UploadResult> {
    console.log('📤 ImageUpload - Starting simple upload process');
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

      // Direct upload
      const result = await EnhancedImageUploadService.uploadImage(imageFile, uniqueFileName);

      if (!result.success) {
        console.error('📤 ImageUpload - Upload failed:', result.error);
        toast.error(`Error al subir imagen: ${result.error}`);
        return { success: false, error: result.error };
      }

      console.log('📤 ImageUpload - ✅ Upload successful');
      toast.success('Imagen subida exitosamente');

      return {
        success: true,
        imageUrl: result.imageUrl
      };

    } catch (error) {
      console.error('📤 ImageUpload - Exception:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al procesar imagen: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Simplified menu item image upload
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
