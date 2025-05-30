
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateUUID } from '../utils/formUtils';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Servicio simple y directo para subir imágenes
 */
export class ImageUploadService {
  private static readonly STORAGE_BUCKET = 'menu_images';

  /**
   * Upload directo a Supabase sin validaciones complejas
   */
  static async uploadImage(imageFile: File): Promise<UploadResult> {
    console.log('📤 SimpleUpload - Starting upload:', imageFile.name);

    try {
      // Generar nombre único
      const fileExtension = imageFile.name.split('.').pop() || 'jpg';
      const uniqueFileName = `menu/${generateUUID()}.${fileExtension}`;

      console.log('📤 SimpleUpload - Uploading to:', uniqueFileName);

      // Upload directo
      const { data, error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(uniqueFileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type
        });

      if (error) {
        console.error('📤 SimpleUpload - Upload failed:', error);
        toast.error(`Error al subir imagen: ${error.message}`);
        return { success: false, error: error.message };
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        console.error('📤 SimpleUpload - No public URL generated');
        return { success: false, error: 'Error generando URL pública' };
      }

      console.log('📤 SimpleUpload - ✅ Success! URL:', urlData.publicUrl);
      toast.success('Imagen subida exitosamente');

      return {
        success: true,
        imageUrl: urlData.publicUrl
      };

    } catch (error) {
      console.error('📤 SimpleUpload - Exception:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al procesar imagen: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Manejo simple para imágenes de items del menú
   */
  static async handleMenuItemImageUpload(
    imageFile: File | null,
    currentImageUrl?: string
  ): Promise<string | undefined> {
    if (!imageFile) {
      return currentImageUrl;
    }

    const result = await this.uploadImage(imageFile);

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload image');
    }

    return result.imageUrl;
  }
}
